export default function Route() {
  return (
    <div className="py-6">
      <p className="text-muted-foreground">
        選挙結果と政党情報を統計的に分析・表示するサイトです。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="mb-2 text-xl font-semibold">地域別選挙結果</h2>
          <p className="text-sm text-muted-foreground">
            各地域の選挙結果を詳細に確認できます。
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="mb-2 text-xl font-semibold">政党別データ</h2>
          <p className="text-sm text-muted-foreground">
            政党ごとの得票数や議席数を比較できます。
          </p>
        </div>
      </div>
    </div>
  )
}
