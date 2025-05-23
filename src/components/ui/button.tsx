"use client"
 
import * as React from "react"
 
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
}
 
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let variantClass = "";
    switch (variant) {
      case "default":
        variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md";
        break;
      case "outline":
        variantClass = "border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent";
        break;
      case "ghost":
        variantClass = "hover:bg-accent/10 hover:text-accent";
        break;
      case "secondary":
        variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm";
        break;
      default:
        variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md";
    }

    let sizeClass = "";
    switch (size) {
      case "default":
        sizeClass = "h-10 px-4 py-2 text-sm";
        break;
      case "sm":
        sizeClass = "h-8 px-3 py-1 text-xs";
        break;
      case "lg":
        sizeClass = "h-12 px-6 py-3 text-base";
        break;
      default:
        sizeClass = "h-10 px-4 py-2 text-sm";
    }

    const buttonClass = `inline-flex items-center justify-center rounded-lg font-medium 
      transition-all duration-200 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none
      hover:scale-105 active:scale-95
      ${variantClass} ${sizeClass} ${className || ""}`;

    return (
      <button className={buttonClass} ref={ref} {...props} />
    )
  }
)

Button.displayName = "Button"
 
export { Button }