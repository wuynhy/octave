import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "./swiper.css";
import { useNavigate } from "react-router-dom";

SwiperCore.use([Navigation]);

const StageCarousel = () => {
  const [stages, setStages] = useState([]);
  const [loop, setLoop] = useState(false);
  const [slides, setSlides] = useState(1);
  const navigate = useNavigate();

  const slidesPerView = useCallback(() => {
    const width = window.innerWidth;

    if (width >= 1920) return 6;
    if (width >= 1440) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;

    return 1;
  }, []);

  const fetchStages = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/stages`);
    const data = await response.json();
    setStages(data);
    const currentSlidesPerView = slidesPerView();
    setSlides(currentSlidesPerView);
    setLoop(data.length >= currentSlidesPerView);
  }, [slidesPerView]);

  useEffect(() => {
    fetchStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const currentSlidesPerView = slidesPerView();
      setSlides(currentSlidesPerView);
      setLoop(stages.length >= currentSlidesPerView);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [slidesPerView, stages]);

  const handleStageClick = (stageId) => {
    navigate(`/stages/${stageId}`);
  };

  return (
    <div className="relative w-10/12 mx-auto">
      <Swiper
        loop={loop}
        slidesPerView={slides}
        spaceBetween={10}
        navigation={loop}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1440: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1920: {
            slidesPerView: 5,
            spaceBetween: 30,
          },
        }}
        className="mySwiper"
      >
        {stages.map((stage) => (
          <SwiperSlide key={stage.id}>
            <div className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer">
              <div className="relative w-full h-56 group">
                <img
                  alt="stage_img"
                  src={stage?.cover_url}
                  className="w-full h-full rounded-lg"
                />
              </div>
              <div className="mt-4 flex flex-col">
                <p className="font-semibold text-lg text-white truncate">
                  {stage.name}
                </p>
                <p className="text-sm truncate text-white mt-1">{stage.host}</p>
                <div className="mt-2">
                  <button
                    className="text-xs bg-indigo-600 text-white rounded px-2 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStageClick(stage.id);
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default StageCarousel;
