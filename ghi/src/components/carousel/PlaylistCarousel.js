import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "./swiper.css";

SwiperCore.use([Navigation]);

const PlaylistCarousel = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loop, setLoop] = useState(false);
  const [slides, setSlides] = useState(1);

  const slidesPerView = useCallback(() => {
    const width = window.innerWidth;

    if (width >= 1920) return 6;
    if (width >= 1440) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;

    return 1;
  }, []);

  const fetchPlaylists = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/playlists`);
    const data = await response.json();
    setPlaylists(data);
    const currentSlidesPerView = slidesPerView();
    setSlides(currentSlidesPerView);
    setLoop(data.length >= currentSlidesPerView);
  }, [slidesPerView]);

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const currentSlidesPerView = slidesPerView();
      setSlides(currentSlidesPerView);
      setLoop(playlists.length >= currentSlidesPerView);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [slidesPerView, playlists]);

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
        {playlists.map((playlist) => (
          <SwiperSlide key={playlist.id}>
            <div className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer">
              <div className="relative w-full h-56 group">
                <img
                  className="w-full h-full rounded-lg"
                  src={playlist.cover_url}
                  alt={playlist.name}
                />
              </div>
              <div className="mt-4 flex flex-col">
                <div className="font-semibold text-lg text-white truncate">
                  {playlist.name}
                </div>
                <p className="text-sm truncate text-white mt-1">
                  {playlist.owner}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PlaylistCarousel;
