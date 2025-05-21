"use client"
 
import * as React from "react"
 
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}
 
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Use the variant and size variables to determine className
    let variantClass = "";
    switch (variant) {
      case "default":
        variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md";
        break;
      case "outline":
        variantClass = "border border-input bg-background hover:bg-primary/10 hover:text-primary hover:border-primary";
        break;
      case "ghost":
        variantClass = "hover:bg-primary/10 hover:text-primary";
        break;
      default:
        variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md";
    }

    let sizeClass = "";
    switch (size) {
      case "default":
        sizeClass = "h-10 px-4 py-2";
        break;
      case "sm":
        sizeClass = "h-8 px-3 py-1 text-sm";
        break;
      case "lg":
        sizeClass = "h-12 px-6 py-3 text-lg";
        break;
      default:
        sizeClass = "h-10 px-4 py-2";
    }

    const buttonClass = `inline-flex items-center justify-center rounded-md font-medium 
      transition-all duration-300 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
      disabled:opacity-50 disabled:pointer-events-none
      hover:translate-y-[-2px] active:translate-y-0
      ${variantClass} ${sizeClass} ${className || ""}`;

    return (
      <button className={buttonClass} ref={ref} {...props} />
    )
  }
)

Button.displayName = "Button"
 
export { Button }