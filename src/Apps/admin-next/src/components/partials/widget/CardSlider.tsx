"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import Image, { StaticImageData } from "next/image";

import "swiper/css";
import "swiper/css/effect-cards";

// image import
import visaCardImage from "@/assets/images/all-img/visa-card-bg.png";
import visaCardImage2 from "@/assets/images/logo/visa.svg";

interface CardItem {
  bg: string;
  cardNo: string;
}

const cardLists: CardItem[] = [
  {
    bg: "from-[#1EABEC] to-primary-500 ",
    cardNo: "****  ****  **** 3945",
  },
  {
    bg: "from-[#4C33F7] to-[#801FE0] ",
    cardNo: "****  ****  **** 3945",
  },
  {
    bg: "from-[#FF9838] to-[#008773]",
    cardNo: "****  ****  **** 3945",
  },
];

const CardSlider= () => {
  return (
    <div>
      <Swiper effect={"cards"} grabCursor={true} modules={[EffectCards]}>
        {cardLists.map((item, i) => (
          <SwiperSlide key={i}>
            <div
              className={`${item.bg} h-[200px] bg-linear-to-r relative rounded-md z-1 p-4 text-white`}
            >
              <div className="overlay absolute left-0 top-0 h-full w-full -z-1">
                <Image
                  src={visaCardImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <Image src={visaCardImage2} alt="" />
              <div className="mt-[18px] font-semibold text-lg mb-[17px]">
                {item.cardNo}
              </div>
              <div className="text-xs text-opacity-75 mb-[2px]">
                Card balance
              </div>
              <div className="text-2xl font-semibold">$10,975</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
