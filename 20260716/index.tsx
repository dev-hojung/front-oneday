import { memo, useCallback, useMemo, useState } from "react";
type ProductCardProps = {
  product: {
    id: number;
    name: string;
    price: number;
  };
  onAdd: (id: number) => void;
};

const ProductCard = memo(function ProductCard({
  product,
  onAdd,
}: ProductCardProps) {
  console.log("ProductCard render");
  return (
    <article>
      <h2>{product.name}</h2>
      <p>{product.price.toLocaleString()}원</p>
      <button onClick={() => onAdd(product.id)}>담기</button>
    </article>
  );
});

export default function ProductPage() {
  const [count, setCount] = useState(0);

  const product = useMemo(
    () => ({
      id: 1,
      name: "기계식 키보드",
      price: 129000,
    }),
    []
  );

  const handleAdd = useCallback((id: number) => {
    console.log(`${id}번 상품을 장바구니에 담았습니다.`);
  }, []);

  return (
    <main>
      <button onClick={() => setCount((value) => value + 1)}>
        부모 상태 변경: {count}
      </button>

      <ProductCard product={product} onAdd={handleAdd} />
    </main>
  );
}