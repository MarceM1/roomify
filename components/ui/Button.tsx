import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
}

const Button = (
    ({ variant = 'primary', size = 'md', fullWidth = false, className, children, ...props }: ButtonProps) => {
        const baseClass = 'btn';
        const variantClass = `btn--${variant}`;
        const sizeClass = `btn--${size}`;
        const fullWidthClass = fullWidth ? 'btn--full' : '';

        const combinedClasses = [
            baseClass,
            variantClass,
            sizeClass,
            fullWidthClass,
            className
        ].filter(Boolean).join(' ');


        return <button className={combinedClasses} {...props}>
            {children}
        </button>;
    }
);


export default Button;
