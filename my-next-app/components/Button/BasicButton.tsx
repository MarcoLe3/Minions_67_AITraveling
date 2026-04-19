interface BasicButtonProp {
  text:string;
  type:"button" | "reset" | "submit" | undefined;
}

export default function BasicButton({text,type = "button"}:BasicButtonProp) {
  return (
      <button
        className="
          typography-button 
          cursor-pointer 
          border
          border-gray-300
          text-primary
          hover:bg-gray-100
          rounded-lg
          font-
          px-2
          py-1
        "
        type={type}
      >
        {text}
      </button>
  );
}