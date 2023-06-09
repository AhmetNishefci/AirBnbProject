'use client'

import { SafeUser } from "../types"
import { AiOutlineHeart } from 'react-icons/ai'
import { AiFillHeart } from 'react-icons/ai'
import useFavorite from "../hooks/useFavorite"

interface HeartButtonProps {
    listingId: string
    currentUser?: SafeUser | null
}

const HeartButton = ({
    listingId,
    currentUser
}: HeartButtonProps) => {
   const { isListingFavorited, toggleFavorite } = useFavorite({
         listingId,
         currentUser
   })

    return (
        <div
            onClick={toggleFavorite}
            className="
                relative
                hover:opacity-80
                transiton
                cursor-pointer
            "
        >
                <AiOutlineHeart
                    size={28}
                    className="
                        fill-white
                        absolute
                        -top-[2px]
                        -right-[2px]
                        "
                />
                <AiFillHeart
                    size={24}
                    className={
                    isListingFavorited ? 'fill-rose-500' : 'fill-neutral-500/70'
                    }
                />
        </div>
    )
}

export default HeartButton