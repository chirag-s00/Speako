export function Wave({ small = false }: { small?: boolean }) {
  const heights = small ? [8, 16, 11, 20, 9] : [14, 26, 38, 22, 30, 14];

  return (
    <span className="inline-flex items-center gap-1">
      {heights.map((height, i) => (
        <i
          key={i}
          className="block w-[3px] rounded-[3px] bg-[#f0a65c]"
          style={{ height }}
        />
      ))}
    </span>
  );
}
