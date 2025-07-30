# 市町村合併時のデータ更新作業手順

市町村合併が発生した際のデータベース更新作業の詳細手順を記載します。

## 概要

市町村合併では、前身自治体の廃止と後継自治体の新設が同時に発生します。選挙統計データの整合性を保つため、以下の手順でデータを更新します。

## 合併パターンの分類

### 1. 合併（MERGE）

複数の前身自治体が1つの後継自治体になるパターン

- 例：A市 + B町 + C村 → D市

### 2. 分割（SPLIT）

1つの前身自治体が複数の後継自治体に分かれるパターン

- 例：A市 → B市 + C市

### 3. 改名（RENAME）

名称のみ変更（境界変更なし）のパターン

- 例：A町 → A市（市制施行）

## データ更新手順

### ステップ1: 事前準備

#### 1.1 合併情報の収集

以下の情報を事前に収集・整理します：

```text
- 合併実施日
- 前身自治体一覧（名称、総務省コード）
- 後継自治体情報（名称、総務省コード）
- 合併種別（MERGE/SPLIT/RENAME）
- 人口按分比率（前身自治体ごと）
```

#### 1.2 データベースバックアップ

```bash
# 本番環境での作業前に必ずバックアップを取得
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

### ステップ2: 前身自治体の廃止処理

#### 2.1 regionsテーブルの更新

```sql
-- 前身自治体を廃止状態に更新
UPDATE regions 
SET 
    abolished_date = '2005-03-31',  -- 合併前日
    is_active = false,
    merger_type = 'MERGER',
    merger_note = 'A市・B町・C村合併によりD市を新設',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN ('region_a_city', 'region_b_town', 'region_c_village');
```

#### 2.2 データ整合性の確認

```sql
-- 廃止された地域の選挙結果が正しく保持されているか確認
SELECT 
    r.name,
    r.abolished_date,
    COUNT(er.id) as result_count
FROM regions r
LEFT JOIN election_results er ON r.id = er.region_id
WHERE r.id IN ('region_a_city', 'region_b_town', 'region_c_village')
GROUP BY r.id, r.name, r.abolished_date;
```

### ステップ3: 後継自治体の新設処理

#### 3.1 regionsテーブルへの挿入

```sql
-- 後継自治体を新規追加
INSERT INTO regions (
    id,
    name, 
    level,
    parent_id,
    code,
    established_date,
    abolished_date,
    is_active,
    sort_order,
    merger_type,
    merger_note,
    created_at,
    updated_at
) VALUES (
    'region_d_city',
    'D市',
    'CITY',
    'prefecture_xx',  -- 都道府県ID
    'XX123',          -- 新しい総務省コード
    '2005-04-01',     -- 合併実施日
    NULL,
    true,
    100,              -- 適切な表示順序
    'MERGER',
    'A市・B町・C村の合併により新設',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

### ステップ4: 継承関係の設定

#### 4.1 region_successionテーブルへの挿入

```sql
-- 継承関係を記録（按分比率は事前調査に基づく）
INSERT INTO region_succession (
    id,
    predecessor_id,
    successor_id,
    succession_type,
    inheritance_ratio,
    effective_date,
    note,
    created_at,
    updated_at
) VALUES 
('succession_a_to_d', 'region_a_city', 'region_d_city', 'MERGE', 0.60, '2005-04-01', 'A市からD市への継承（人口比60%）', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('succession_b_to_d', 'region_b_town', 'region_d_city', 'MERGE', 0.30, '2005-04-01', 'B町からD市への継承（人口比30%）', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('succession_c_to_d', 'region_c_village', 'region_d_city', 'MERGE', 0.10, '2005-04-01', 'C村からD市への継承（人口比10%）', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

#### 4.2 継承比率の合計確認

```sql
-- 継承比率の合計が1.0になることを確認
SELECT 
    successor_id,
    SUM(inheritance_ratio) as total_ratio
FROM region_succession 
WHERE successor_id = 'region_d_city'
GROUP BY successor_id;

-- 結果: total_ratio = 1.00 であることを確認
```

### ステップ5: データ整合性の最終確認

#### 5.1 地域データの確認

```sql
-- 前身自治体が正しく廃止されているか確認
SELECT 
    name,
    established_date,
    abolished_date,
    is_active,
    merger_type
FROM regions 
WHERE id IN ('region_a_city', 'region_b_town', 'region_c_village');

-- 後継自治体が正しく作成されているか確認  
SELECT 
    name,
    established_date,
    abolished_date,
    is_active,
    merger_type
FROM regions 
WHERE id = 'region_d_city';
```

#### 5.2 継承関係の確認

```sql
-- 継承関係が正しく設定されているか確認
SELECT 
    rs.id,
    p.name as predecessor_name,
    s.name as successor_name,
    rs.succession_type,
    rs.inheritance_ratio,
    rs.effective_date
FROM region_succession rs
JOIN regions p ON rs.predecessor_id = p.id
JOIN regions s ON rs.successor_id = s.id
WHERE rs.successor_id = 'region_d_city';
```

#### 5.3 選挙結果データの確認

```sql
-- 前身自治体の選挙結果が保持されているか確認
SELECT 
    e.held_at,
    r.name,
    COUNT(er.id) as result_count
FROM elections e
JOIN election_results er ON e.id = er.election_id
JOIN regions r ON er.region_id = r.id
WHERE r.id IN ('region_a_city', 'region_b_town', 'region_c_village')
GROUP BY e.held_at, r.name
ORDER BY e.held_at DESC, r.name;
```

## 按分計算の実装例

### 時系列比較での按分計算

合併後の選挙結果と合併前の選挙結果を比較する際の按分計算例：

```sql
-- D市の2007年選挙結果と前身自治体の2003年選挙結果を按分比較
WITH successor_results AS (
    -- 後継自治体（D市）の2007年結果
    SELECT 
        er.party_id,
        er.votes as successor_votes
    FROM election_results er
    JOIN elections e ON er.election_id = e.id
    WHERE er.region_id = 'region_d_city' 
    AND e.held_at = '2007-07-29'
),
predecessor_results AS (
    -- 前身自治体の2003年結果を按分比率で調整
    SELECT 
        er.party_id,
        SUM(er.votes * rs.inheritance_ratio) as adjusted_predecessor_votes
    FROM election_results er
    JOIN elections e ON er.election_id = e.id
    JOIN region_succession rs ON er.region_id = rs.predecessor_id
    WHERE rs.successor_id = 'region_d_city'
    AND e.held_at = '2003-11-09'
    GROUP BY er.party_id
)
SELECT 
    sr.party_id,
    sr.successor_votes,
    pr.adjusted_predecessor_votes,
    (sr.successor_votes - pr.adjusted_predecessor_votes) as vote_diff,
    ROUND(
        ((sr.successor_votes - pr.adjusted_predecessor_votes) * 100.0 / pr.adjusted_predecessor_votes), 
        2
    ) as growth_rate_percent
FROM successor_results sr
LEFT JOIN predecessor_results pr ON sr.party_id = pr.party_id;
```

## 注意事項

### データ更新時の重要な注意点

1. **作業タイミング**: 合併実施日以降に作業を実施
2. **バックアップ**: 必ず事前にデータベースバックアップを取得
3. **按分比率**: 人口比率などの公的データに基づいて設定
4. **データ整合性**: 更新後は必ず整合性チェックを実施
5. **履歴保持**: 前身自治体のデータは削除せず、廃止状態で保持

### トラブルシューティング

#### 按分比率の合計が1.0にならない場合

```sql
-- 按分比率を正規化して調整
UPDATE region_succession 
SET inheritance_ratio = inheritance_ratio / (
    SELECT SUM(inheritance_ratio) 
    FROM region_succession rs2 
    WHERE rs2.successor_id = region_succession.successor_id
)
WHERE successor_id = 'region_d_city';
```

#### 既存データとの競合が発生した場合

```sql
-- 既存の継承関係を確認
SELECT * FROM region_succession 
WHERE predecessor_id IN ('region_a_city', 'region_b_town', 'region_c_village')
   OR successor_id = 'region_d_city';

-- 必要に応じて重複データを削除
DELETE FROM region_succession 
WHERE id = 'duplicate_succession_id';
```

## チェックリスト

### 作業前チェックリスト

- [ ] 合併情報の収集完了
- [ ] 按分比率の算出完了  
- [ ] データベースバックアップ取得完了
- [ ] 作業用SQLスクリプト準備完了

### 作業後チェックリスト

- [ ] 前身自治体の廃止処理完了
- [ ] 後継自治体の新設処理完了
- [ ] 継承関係の設定完了
- [ ] 按分比率の合計 = 1.0 確認完了
- [ ] データ整合性チェック完了
- [ ] アプリケーションでの動作確認完了

## 関連ファイル

- `designs/er-diagram.md` - データベース設計詳細
- `designs/domain-model.md` - ドメインモデル設計
- `scripts/` - 合併処理用SQLスクリプト（別途作成予定）

## 履歴

| 日付       | 変更内容 | 作成者   |
| ---------- | -------- | -------- |
| 2025-07-29 | 初版作成 | システム |
