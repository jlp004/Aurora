interface CommentProps {
    poster: string;
    text: string;
  }
  
  const Comment = ({ poster, text }: CommentProps) => {
    return (
      <div
        style={{
          border: '2px solid #a855f7',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '12px'
        }}
      >
        <strong style={{ color: '#a855f7' }}>{poster}</strong>: <span style={{ color: 'black' }}>{text}</span>
      </div>
    );
  };
  
  export default Comment;
  