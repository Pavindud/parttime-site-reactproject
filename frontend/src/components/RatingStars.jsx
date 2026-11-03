import '../styles/RatingStars.css';

export default function RatingStars({ stars }) {
  if (stars === null || stars === undefined || stars === '') {
    return <span className="ratingstars-container ratingstars-value">No ratings</span>;
  }

  const num = Number(stars);
  const rounded = Math.round(num);

  const starString = Array.from({ length: 5 }, (_, i) => (i < rounded ? '★' : '☆')).join('');

  return (
    <span className="ratingstars-container">
      <span className="ratingstars-stars">{starString}</span>
      <span className="ratingstars-value">({num.toFixed(1)})</span>
    </span>
  );
}
