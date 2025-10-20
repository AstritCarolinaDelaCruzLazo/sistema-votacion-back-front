/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        onpeBlack:"#1E1E1E", onpeGray:"#F4F4F4", onpeWhite:"#FFFFFF", onpeRed:"#E30613"
      },
      fontFamily:{ sans:["Inter","sans-serif"] },
      borderRadius:{ xl:"12px" },
      boxShadow:{ card:"0 2px 10px rgba(0,0,0,.08)" }
    }
  },
  plugins:[]
}
