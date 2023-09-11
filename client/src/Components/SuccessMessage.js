export default function SuccessMessage({ message }) {
  if (!message) return null;

  return (
    <div className="alert alert-success" style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"27%",height:"100%"}}>
        <label>{message}</label>
      </div>
    </div>
  );
}