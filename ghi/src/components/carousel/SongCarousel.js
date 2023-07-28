import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "./swiper.css";
import SongCard from "../Musicplayer/SongCard";

SwiperCore.use([Navigation]);

const SongCarousel = () => {
  const [songs, setSongs] = useState([]);
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

  const fetchSongs = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_HOST}/songs`);
    const data = await response.json();
    setSongs(data);
    const currentSlidesPerView = slidesPerView();
    setSlides(currentSlidesPerView);
    setLoop(data.length >= currentSlidesPerView);
  }, [slidesPerView]);

  useEffect(() => {
    fetchSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const currentSlidesPerView = slidesPerView();
      setSlides(currentSlidesPerView);
      setLoop(songs.length >= currentSlidesPerView);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [slidesPerView, songs]);

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
        {songs.map((song, index) => (
          <SwiperSlide key={song.id}>
            <SongCard song={song} allSongs={songs} i={index} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SongCarousel;
