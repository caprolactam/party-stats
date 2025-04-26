import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'サイトについて | 政党スタッツ',
      },
      {
        name: 'description',
        content: 'サイトの概要・質問',
      },
    ],
  }),
})

function RouteComponent() {
  return (
    <div className='prose mt-12 grid max-w-[60ch] gap-12'>
      <div>
        <h1 className='text-3xl font-bold'>サイトについて</h1>
        <p className='text-brand-11 mt-(--space-base)'>
          サイトの概要および質問
        </p>
      </div>
      <div>
        <h2 className='text-2xl font-semibold'>サイトの概要</h2>
        <p className='mt-(--space-base)'>
          このサイトは、総務省の選挙関連資料をもとに国政選挙における各市町村ごとの政党の投票データをまとめたものです。衆議院選挙については、比例代表の各市町村別得票数を用いています。参議院選挙については、比例代表の候補者別市区町村別得票数のうち得票総数（政党等の得票総数と名簿登載者の得票総数の和）を用いています。
          出典は各ページに記載しています。
        </p>
      </div>
      <div>
        <h2 className='text-2xl font-semibold'>質問</h2>
        <ul className='mt-(--space-base) grid list-disc gap-12 pl-6'>
          <li>
            <div className='grid gap-(--space-base)'>
              <h3 className='text-xl font-semibold'>
                コンテンツの利用について
              </h3>
              <p>
                当サイトのコンテンツ利用につき条件はありません。ただし
                <a
                  className='text-link-base underline-offset-2 hover:underline'
                  href='https://www.soumu.go.jp/menu_kyotsuu/policy/tyosaku.html#tyosakuken'
                >
                  総務省の利用規約
                </a>
                に従ってください。
              </p>
              <p>
                <a
                  className='text-link-base underline-offset-2 hover:underline'
                  href='https://github.com/caprolactam/party-stats'
                >
                  ソースコード
                </a>
                は
                <a
                  className='text-link-base underline-offset-2 hover:underline'
                  href='https://github.com/caprolactam/party-stats/blob/main/LICENSE'
                >
                  MITライセンス
                </a>
                の下で利用可能です。また
                <a
                  className='text-link-base underline-offset-2 hover:underline'
                  href='https://github.com/caprolactam/party-stats-json'
                >
                  JSONとしてデータを利用
                </a>
                することも可能です。
              </p>
            </div>
          </li>
          <li>
            <h3 className='text-xl font-semibold'>データの取り扱いについて</h3>
            <p className='mt-(--space-base)'>
              データには誤りがある可能性があります。もしデータの誤りを見つけた場合は、お気軽にIssueを送ってください。ただし、以下の理由により実際のデータとは一致しない場合があります。
            </p>
            <ul className='mt-(--space-base) grid list-disc gap-(--space-base) pl-6'>
              <li>
                <div className='grid gap-2'>
                  <h4 className='font-semibold'>
                    小数点以下の取り扱いによる違い
                  </h4>
                  <p>
                    当サイトでは元のデータから小数点以下三桁目まで取得し、四桁目以降を切り捨てて使用しています。
                  </p>
                </div>
              </li>
              <li>
                <div className='grid gap-2'>
                  <h4 className='font-semibold'>
                    行政区分と選挙の区分けが異なる場合
                  </h4>
                  <p>
                    選挙区が二つ以上の市区町村にまたがった状態で集計されている場合、当サイトの独断によりどちらか一方の市区町村に割り当てています。
                  </p>
                  <p>
                    <a
                      href='https://www.soumu.go.jp/senkyo/senkyo_s/data/shugiin48/shikuchouson_15.html'
                      className='text-link-base underline-offset-2 hover:underline'
                    >
                      第48回
                    </a>
                    および
                    <a
                      href='https://www.soumu.go.jp/senkyo/senkyo_s/data/shugiin49/shikuchouson_15.html'
                      className='text-link-base underline-offset-2 hover:underline'
                    >
                      第49回衆議院議員総選挙の新潟県
                    </a>
                    において新潟市江南区、新潟市北区はまとめて集計されており、新潟市江南区に割り当てています。
                  </p>
                  <p>
                    <a
                      href='https://www.soumu.go.jp/senkyo/senkyo_s/data/shugiin48/shikuchouson_14.html'
                      className='text-link-base underline-offset-2 hover:underline'
                    >
                      第48回
                    </a>
                    および
                    <a
                      href='https://www.soumu.go.jp/senkyo/senkyo_s/data/shugiin49/shikuchouson_14.html'
                      className='text-link-base underline-offset-2 hover:underline'
                    >
                      第49回衆議院議員総選挙の神奈川県
                    </a>
                    において川崎市高津区と中原区、川崎市多摩区と宮前区はそれぞれまとめて集計されています。
                    当サイトではそれぞれ川崎市高津区、川崎市多摩区に割り当てています。
                  </p>
                </div>
              </li>
              <li>
                <div className='grid gap-2'>
                  <h4 className='font-semibold'>
                    選挙当時と現在で行政区分が異なる場合
                  </h4>
                  <p>
                    当サイトでは現在の行政区分が選挙当時既に存在したかのように取り扱っています。
                  </p>
                  <p>
                    第26回参議院議員総選挙までの時点において、中央区、浜名区、天竜区は静岡県に存在しませんでした。しかし当時の選挙において中区、東区、西区、南区が中央区として、北区、浜北区が浜名区として、天竜区が天竜区として既に存在したものとしてそれぞれの区に割り当てています。
                    <span className='font-bold'>
                      (※これは実際の再編区域と完全には一致しません。)
                    </span>
                  </p>
                  <p>
                    第48回衆議院議員総選挙の時点において、那珂川市は福岡県に存在しませんでした。しかし那珂川町が那珂川市として既に存在したものとして取り扱っています。
                  </p>
                </div>
              </li>
              <li>
                <div className='grid gap-2'>
                  <h4 className='font-semibold'>
                    元データに不一致があり正しいデータが確定できない場合
                  </h4>
                  <p>
                    たとえば、
                    <a
                      href='https://www.soumu.go.jp/senkyo/senkyo_s/data/sangiin25/index.html'
                      className='text-link-base underline-offset-2 hover:underline'
                    >
                      第25回参議院議員総選挙
                    </a>
                    において長野県全体の「安楽死制度を考える会」の得票総数が、都道府県別党派別得票数（比例代表）および長野県候補者別市区町村別得票数で異なります（「労働の解放をめざす労働者党」についても同様）。このため長野県ないし全国での得票数を確定させることができません。
                  </p>
                  <p>
                    当サイトでは各市町村別得票数のデータが正しいものとみなして集計を行っています。
                  </p>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )
}
