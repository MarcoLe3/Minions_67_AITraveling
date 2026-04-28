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
          bg-[#4285F4]
          text-white
          hover:bg-[#3066be]
          hover:shadow-xl
          rounded-4xl
          font-semibold
          px-3
          py-1
        "
        type={type}
      >
        {text}
      </button>
  );
}