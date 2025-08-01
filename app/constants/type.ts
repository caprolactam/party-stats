/**
 * Branded型は基本型Valueにブランドを付与し、
 * 型の識別を強化するために使用します。
 * ```ts
 * type Money = Branded<number, "Money">;
 * ```
 */
export type Branded<Value, Brand> = Value & { readonly _brand: Brand }
