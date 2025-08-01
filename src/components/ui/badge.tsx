import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-french-blue-600 text-white hover:bg-french-blue-700",
        secondary:
          "border-transparent bg-admin-gray-100 text-admin-gray-900 hover:bg-admin-gray-200",
        destructive:
          "border-transparent bg-urgent-red-600 text-white hover:bg-urgent-red-700",
        outline: "text-gray-950 border-gray-200",
        success:
          "border-transparent bg-compliance-green-600 text-white hover:bg-compliance-green-700",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        compliant:
          "border-transparent bg-compliance-green-100 text-compliance-green-800",
        "non-compliant":
          "border-transparent bg-urgent-red-100 text-urgent-red-800",
        pending:
          "border-transparent bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }