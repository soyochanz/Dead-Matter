"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, size = "lg", floating = true, animate = true, ...props }, ref) => {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
    xl: "h-28 w-28",
    "2xl": "h-36 w-36"
  }

  const sizeClass = sizeClasses[size] || sizeClasses.lg

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={floating ? { scale: 1.05, y: -2 } : false}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      className="relative inline-block"
    >
      {/* Floating shadow effect */}
      {floating && (
        <motion.div
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-lg opacity-70"
        />
      )}

      {/* Outer glow ring */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 opacity-20 blur-sm" />

      {/* Main avatar container */}
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-gray-900 to-black shadow-2xl",
          sizeClass,
          floating && "shadow-red-500/10",
          className
        )}
        {...props}
      />
      
      {/* Animated border ring */}
      {floating && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-1 rounded-full border-2 border-transparent border-t-red-500/30 border-r-orange-500/30"
        />
      )}
    </motion.div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, loading = "eager", quality = "high", ...props }, ref) => {
  const [loaded, setLoaded] = React.useState(false)

  return (
    <>
      <AvatarPrimitive.Image
        ref={ref}
        loading={loading}
        quality={quality}
        onLoadingStatusChange={(status) => setLoaded(status === "loaded")}
        className={cn(
          "aspect-square h-full w-full object-cover transition-all duration-500",
          !loaded && "scale-110 blur-sm grayscale",
          loaded && "scale-100 blur-0 grayscale-0",
          className
        )}
        {...props}
      />
      {/* Loading shimmer effect */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 animate-pulse rounded-full" />
      )}
    </>
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, children, showInitials = true, gradient = "red-orange", ...props }, ref) => {
  const gradients = {
    "red-orange": "from-red-600 to-orange-600",
    "blue-cyan": "from-blue-600 to-cyan-600",
    "purple-pink": "from-purple-600 to-pink-600",
    "green-emerald": "from-green-600 to-emerald-600",
    "gray": "from-gray-700 to-gray-900"
  }

  const gradientClass = gradients[gradient] || gradients["red-orange"]

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-white font-bold shadow-inner",
          gradientClass,
          className
        )}
        {...props}
      >
        {showInitials && children && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-current"
          >
            {typeof children === 'string' ? children.charAt(0).toUpperCase() : children}
          </motion.span>
        )}
      </AvatarPrimitive.Fallback>
    </motion.div>
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// New Professional Avatar Components
const AvatarGroup = React.forwardRef(({ className, children, max = 4, spacing = -4, ...props }, ref) => {
  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, max)
  const extraCount = avatars.length - max

  return (
    <div 
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative"
          style={{ marginLeft: index > 0 ? `${spacing}px` : 0 }}
        >
          {React.cloneElement(avatar, {
            size: "md",
            floating: false,
            className: cn(
              avatar.props.className,
              "border-2 border-gray-900"
            )
          })}
        </div>
      ))}
      {extraCount > 0 && (
        <div
          className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-900 text-white text-sm font-bold ml-[-8px] shadow-lg"
        >
          +{extraCount}
        </div>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

const AvatarWithBadge = React.forwardRef(({ className, children, badgeContent, badgeColor = "red", badgePosition = "bottom-right", ...props }, ref) => {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0"
  }

  const badgeColors = {
    red: "bg-gradient-to-r from-red-600 to-red-700 border-red-500",
    green: "bg-gradient-to-r from-green-600 to-emerald-600 border-green-500",
    blue: "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500",
    orange: "bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500",
    purple: "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500"
  }

  return (
    <div className="relative inline-block">
      {children}
      {badgeContent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className={cn(
            "absolute w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white shadow-lg z-10",
            positionClasses[badgePosition],
            badgeColors[badgeColor]
          )}
        >
          {badgeContent}
        </motion.div>
      )}
    </div>
  )
})
AvatarWithBadge.displayName = "AvatarWithBadge"

const AvatarHoverCard = React.forwardRef(({ className, children, hoverContent, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div 
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && hoverContent && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50"
          >
            <div className="relative">
              {/* Arrow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900/95" />
              
              {/* Content card */}
              <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-2xl min-w-[200px]">
                {hoverContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
AvatarHoverCard.displayName = "AvatarHoverCard"

export { 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  AvatarGroup,
  AvatarWithBadge,
  AvatarHoverCard
}