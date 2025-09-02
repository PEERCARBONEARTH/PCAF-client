import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				'border-light': 'hsl(var(--border-light))',
				'border-strong': 'hsl(var(--border-strong))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				'background-alt': 'hsl(var(--background-alt))',
				foreground: 'hsl(var(--foreground))',
				
				// PeerCarbon Brand Colors
				peercarbon: {
					primary: 'hsl(var(--peercarbon-primary))',
					secondary: 'hsl(var(--peercarbon-secondary))',
					accent: 'hsl(var(--peercarbon-accent))'
				},
				
				// Enhanced Primary System
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))',
					glow: 'hsl(var(--primary-glow))',
					soft: 'hsl(var(--primary-soft))',
					muted: 'hsl(var(--primary-muted))'
				},
				
				// Professional Secondary System
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					light: 'hsl(var(--secondary-light))',
					soft: 'hsl(var(--secondary-soft))'
				},
				
				// Advanced Finance Branding
				finance: {
					DEFAULT: 'hsl(var(--finance))',
					foreground: 'hsl(var(--finance-foreground))',
					light: 'hsl(var(--finance-light))',
					accent: 'hsl(var(--finance-accent))',
					neutral: 'hsl(var(--finance-neutral))'
				},
				
				// Enhanced Status Colors
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					light: 'hsl(var(--success-light))',
					muted: 'hsl(var(--success-muted))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					light: 'hsl(var(--warning-light))',
					muted: 'hsl(var(--warning-muted))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
					light: 'hsl(var(--info-light))',
					muted: 'hsl(var(--info-muted))'
				},
				error: {
					DEFAULT: 'hsl(var(--error))',
					foreground: 'hsl(var(--error-foreground))',
					light: 'hsl(var(--error-light))',
					muted: 'hsl(var(--error-muted))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				
				// Advanced Neutral System
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					alt: 'hsl(var(--muted-alt))'
				},
				
				// Sophisticated Accent System
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					light: 'hsl(var(--accent-light))',
					soft: 'hsl(var(--accent-soft))'
				},
				
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					alt: 'hsl(var(--card-alt))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			
			// Enhanced Shadow System
			boxShadow: {
				'xs': 'var(--shadow-xs)',
				'sm': 'var(--shadow-sm)',
				'card': 'var(--shadow-card)',
				'elevated': 'var(--shadow-elevated)',
				'floating': 'var(--shadow-floating)',
				'glow': 'var(--shadow-glow)',
				'focus': 'var(--shadow-focus)',
				'hover': 'var(--shadow-hover)',
				'premium': 'var(--shadow-premium)',
				'glass': 'var(--shadow-glass)',
				'inset': 'var(--shadow-inset)',
				'strong': 'var(--shadow-strong)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				
				// Enhanced Fade Animations
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'fade-in-right': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				
				// Professional Scale Animations
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-in-center': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				
				// Advanced Background Animations
				'float-background': {
					'0%, 100%': { transform: 'translateX(0) translateY(0) scale(1)' },
					'25%': { transform: 'translateX(5px) translateY(-5px) scale(1.02)' },
					'50%': { transform: 'translateX(-3px) translateY(3px) scale(0.98)' },
					'75%': { transform: 'translateX(-7px) translateY(-2px) scale(1.01)' }
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				
				// Premium Glow Effects
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' }
				},
				'glow-subtle': {
					'0%, 100%': { boxShadow: 'var(--shadow-card)' },
					'50%': { boxShadow: 'var(--shadow-glow)' }
				},
				
				// Enhanced Shimmer
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'shimmer-slow': {
					'0%': { transform: 'translateX(-100%) skewX(-15deg)' },
					'100%': { transform: 'translateX(200%) skewX(-15deg)' }
				},
				
				// Professional Slide Animations
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				
				// Professional Fade Animations
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-left': 'fade-in-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-in-right': 'fade-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				
				// Enhanced Scale Animations
				'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in-center': 'scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				
				// Advanced Background Effects
				'float-background': 'float-background 20s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
				
				// Premium Glow Effects
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'glow-subtle': 'glow-subtle 3s ease-in-out infinite',
				
				// Enhanced Shimmer
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'shimmer-slow': 'shimmer-slow 3s ease-in-out infinite',
				
				// Professional Slide Animations
				'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				
				// Staggered Animations
				'stagger-1': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
				'stagger-2': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
				'stagger-3': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
				'stagger-4': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both',
				'stagger-5': 'fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both'
			},
			
			// Enhanced Font System
			fontFamily: {
				'sans': ['Inter', 'Raleway', 'system-ui', '-apple-system', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'raleway': ['Raleway', 'sans-serif'],
				'display': ['Inter', 'Raleway', 'system-ui', 'sans-serif'],
				'body': ['Inter', 'system-ui', 'sans-serif']
			},
			
			// Enhanced Transition System  
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'elegant': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'premium': 'cubic-bezier(0.23, 1, 0.32, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
