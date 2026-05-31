interface NodeContentProps {
  text: string;
  level: number;
  image?: string;
  note?: string;
}

export function NodeContent({ text, level, image, note }: NodeContentProps) {
  const isRoot = level === 0;
  const textClasses = isRoot
    ? 'text-lg font-bold'
    : 'text-sm';

  return (
    <div className="relative flex items-center gap-2">
      {image && (
        <img
          src={image}
          alt={text}
          className="w-14 h-14 object-cover rounded-lg"
          draggable={false}
        />
      )}

      <span className={`${textClasses} whitespace-nowrap select-none`}>
        {text}
      </span>

      {note && (
        <span
          className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
          title={note}
        />
      )}
    </div>
  );
}
