"use client";

import React, { useState } from "react";
import blackJumper from "@/assets/images/e-commerce/product-card/classical-black-tshirt.png";
import blackTshirt from "@/assets/images/e-commerce/product-card/black-t-shirt.png";
import checkShirt from "@/assets/images/e-commerce/product-card/check-shirt.png";
import grayJumper from "@/assets/images/e-commerce/product-card/gray-jumper.png";
import grayTshirt from "@/assets/images/e-commerce/product-card/gray-t-shirt.png";
import pinkBlazer from "@/assets/images/e-commerce/product-card/pink-blazer.png";
import redTshirt from "@/assets/images/e-commerce/product-card/red-t-shirt.png";
import yellowFrok from "@/assets/images/e-commerce/product-card/yellow-frok.png";
import yellowJumper from "@/assets/images/e-commerce/product-card/yellow-jumper.png";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import useRtl from "@/hooks/useRtl";
import type { StaticImageData } from "next/image";

interface ProductImage {
  publicURL?: string;
  url?: string;
}

interface Product {
  name?: string;
  images?: (string | ProductImage)[];
}

interface ThumbSliderComProps {
  product?: Product;
}

const ThumbSliderCom: React.FC<ThumbSliderComProps> = ({ product }) => {
  // Use images from product if available, otherwise fallback to hardcoded images
  const getImages = (): (string | StaticImageData)[] => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      // Map API images (objects with publicURL) to URLs
      return product.images.map(img =>
        typeof img === 'string' ? img : (img.publicURL || img.url || '')
      ).filter((url): url is string => Boolean(url));
    }
    // Fallback to hardcoded images
    return [
      blackJumper,
      blackTshirt,
      checkShirt,
      grayTshirt,
      grayJumper,
      pinkBlazer,
      redTshirt,
      yellowFrok,
      yellowJumper,
    ];
  };

  const images = getImages();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isRtl] = useRtl();

  return (
    <>
      <Swiper
        key={`${isRtl}-swiper`}
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        } as React.CSSProperties}
        loop={images.length > 1}
        spaceBetween={10}
        navigation={false}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
      >
        {images.length > 0 ? (
          images.map((image, i) => {
            const imgSrc = typeof image === 'string' ? image : image.src;
            return (
              <SwiperSlide
                key={i}
                className="h-[409px] w-[396px] py-11 px-14 bg-secondary-200 rounded-md"
              >
                <img
                  className="  h-full w-full  object-contain  transition-all duration-300 group-hover:scale-105"
                  src={imgSrc}
                  alt={product?.name || "Product image"}
                />
              </SwiperSlide>
            );
          })
        ) : (
          <SwiperSlide className="h-[409px] w-[396px] py-11 px-14 bg-secondary-200 rounded-md">
            <div className="h-full w-full flex items-center justify-center text-slate-400">
              No image available
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {images.length > 1 && (
        <div className="flex mt-6 space-x-3 rtl:space-x-reverse ">
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={images.length > 1}
            spaceBetween={10}
            slidesPerView={Math.min(4, images.length)}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper"
          >
            {images.map((image, j) => {
              const imgSrc = typeof image === 'string' ? image : image.src;
              return (
                <SwiperSlide
                  key={`second_slider_${j}`}
                  className="h-[90px] w-[90px] py-[14px] px-[17px] bg-secondary-200 rounded-sm"
                >
                  <img
                    className="  h-full w-full  object-contain"
                    src={imgSrc}
                    alt={product?.name || "Product thumbnail"}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </>
  );
};

export default ThumbSliderCom;
