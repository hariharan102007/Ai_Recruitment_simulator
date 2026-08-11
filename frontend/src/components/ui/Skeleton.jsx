const Skeleton = ({ type = 'line', className = '', count = 3 }) => {
  if (type === 'circle') return <div className={`w-12 h-12 rounded-full skeleton ${className}`} />;
  if (type === 'card') return <div className={`glass-card p-6 space-y-3 ${className}`}>{Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />)}</div>;

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
};

export default Skeleton;
