export function HeroSection() {
  return (
    <section className="space-y-6 text-center">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          選挙結果を探してみましょう
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          衆議院・参議院選挙の結果を地域別・政党別にわかりやすく提供します。
        </p>
      </div>
      <div className="mx-auto max-w-lg space-y-3">
        <p className="text-sm text-muted-foreground">
          3つの方法から選挙結果にアクセスできます
        </p>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            📅
            選挙年度
          </span>
          <span className="flex items-center gap-1">
            🗾
            地域
          </span>
          <span className="flex items-center gap-1">
            🏛️
            政党
          </span>
        </div>
      </div>
    </section>
  )
}
