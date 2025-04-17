export function RootRoute() {
  return (
    <html lang='ja'>
      <head>
        <meta charSet='utf-8' />
        <meta
          content='width=device-width, initial-scale=1'
          name='viewport'
        />
        <meta
          name='referrer'
          content='no-referrer'
        />
        <title data-static>政党スタッツ</title>
        <meta
          data-static
          name='description'
          content='国政選挙における政党の得票データのまとめ'
        />
        <link
          rel='icon'
          type='image/svg+xml'
          href='/favicons/favicon.svg'
        />
        {import.meta.env.PROD && (
          <link
            rel='stylesheet'
            href='/assets/index.css'
          />
        )}
        {import.meta.env.PROD ? (
          <script
            type='module'
            src='/entry-client.js'
          ></script>
        ) : (
          <script
            type='module'
            src='/src/main.tsx'
          ></script>
        )}
      </head>
      <body>
        <div id='root'></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  document.addEventListener('DOMContentLoaded', () => {
    const staticHeadTags = document.querySelectorAll('[data-static]')
    staticHeadTags.forEach(el => el.remove())
  })`,
          }}
        ></script>
      </body>
    </html>
  )
}
