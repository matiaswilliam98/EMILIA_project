import React, { useState } from "react";
import { Box, Stack, Typography, Card, IconButton, Modal, TextField, CardContent } from "@mui/material";
import ReactPlayer from "react-player";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// 📌 Función para transformar URLs de YouTube a formato embed
const getEmbeddedUrl = (url) => {
  let videoId = url.split("watch?v=")[1]?.split("&")[0] || url.split("shorts/")[1]?.split("?")[0] || url.split("/").pop();
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&playsinline=1&loop=1`;
};

// 📌 Datos de prueba
const demoVideos = {
  "Relajación y Meditación 🌿": [
    { id: "1", title: "Respiración 4-4-4", channel: "Medita por el mundo", thumbnail: "https://i3.ytimg.com/vi/cVH3HOgNylM/maxresdefault.jpg", url: "https://www.youtube.com/shorts/v0oXAnyTyWo?rel=0" },
    { id: "2", title: "Respiración 4-7-8 para relajación profunda", channel: "Medita por el mundo", thumbnail: "https://i3.ytimg.com/vi/EGO5m_DBzF8/maxresdefault.jpg", url: "https://www.youtube.com/shorts/NykLjrf0cV8" },
    { id: "3", title: "Respiración 4-8 relajación para disminuir los niveles de estrés y ansiedad", channel: "Medita por el mundo", thumbnail: "https://i3.ytimg.com/vi/CY5L5duz0kA/maxresdefault.jpg", url: "https://www.youtube.com/shorts/EK679NgFdPo" },
    { id: "4", title: "Mindfullnes para calmar la ansiedad", channel: "Medita por el mundo", thumbnail: "https://i3.ytimg.com/vi/XJtHLwxqNHg/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=XJtHLwxqNHg" },
    { id: "5", title: "Mindfullnes para calmar la ansiedad", channel: "Chris Núñez Psicólogo", thumbnail: "https://i3.ytimg.com/vi/37rS9v_Fnyw/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=Zv0MvfYmiKg" }
  ],
  "Técnicas de Organización y Productividad 📅": [
    { id: "6", title: "El método para definir tu misión en la vida y transformar tu futuro", channel: "Daniel Bonifaz - Nizz", thumbnail: "https://i3.ytimg.com/vi/Xj8i880xjFM/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=Xj8i880xjFM" },
    { id: "7", title: "Como organizar tu tiempo para ser más productivo", channel: "The Saiyan Kiwi", thumbnail: "https://i3.ytimg.com/vi/e9iqXyd98ig/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=e9iqXyd98ig" },
    { id: "8", title: "Como estructurar tu día según la ciencia", thumbnail: "https://i3.ytimg.com/vi/xCOZrtNFExg/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=xCOZrtNFExg" }
  ],
  "Motivación y Resiliencia Emocional 💪": [
    { id: "9", title: "Ve por el 100", channel: "El Sendero de la Vida", thumbnail: "https://i3.ytimg.com/vi/gMDAPSWeqOo/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=gMDAPSWeqOo&t=134s" },
    { id: "10", title: "Da un ultimo empujón", channel: "El Sendero de la Vida", thumbnail: "https://i3.ytimg.com/vi/WN_pRi27HjU/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=WN_pRi27HjU" },
    { id: "11", title: "Esto apenas comienza", channel: "El Sendero de la Vida", thumbnail: "https://i3.ytimg.com/vi/qKCCCDjxids/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=qKCCCDjxids" }
  ],
  "Ejercicios para el Manejo de la Ansiedad 🤯": [
    { id: "12", title: "Ataque de ansiedad: Consejos sobre cómo combatir la ansiedad", channel: "Sanitas", thumbnail: "https://i3.ytimg.com/vi/34ZVrmJxEUo/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=34ZVrmJxEUo" },
    { id: "13", title: "Ejercicios cortos para calmar la ansiedad", channel: "Jordi Wu", thumbnail: "https://i3.ytimg.com/vi/gFSFuTM7Yd8/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=gFSFuTM7Yd8" },
    { id: "14", title: "6 Ejercicios para calmar la ansiedad", channel: "Centro Médico ABC", thumbnail: "https://i3.ytimg.com/vi/ifKLyrl2mTk/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=ifKLyrl2mTk" }
  ],
  "Ejercicios Físicos y Yoga para el Bienestar 🧘": [
    { id: "15", title: "Yoga para comenzar el día con energía", channel: "Regina Marco", thumbnail: "https://i3.ytimg.com/vi/1En6toGgYGQ/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=1En6toGgYGQ" },
    { id: "16", title: "Yoga para levantar el ánimo", channel: "Yoga con Palo y Dan", thumbnail: "https://i3.ytimg.com/vi/KIrlEDIwr_g/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=KIrlEDIwr_g" },
    { id: "17", title: "Yoga para calmar estrés y ansiedad", channel: "Calm", thumbnail: "https://i3.ytimg.com/vi/lJnS6yIiW8Y/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=lJnS6yIiW8Y" }
  ],
  "Estrategias Cognitivas 🧠": [
    { id: "18", title: "Cómo concentrarse mejor para estudiar | 5 tips para concentración máxima", channel: "Carlos Reyes", thumbnail: "https://i3.ytimg.com/vi/TpfjkBxAECs/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=TpfjkBxAECs" },
    { id: "19", title: "Ejercicios para mejorar la concentración", channel: "Escuela de la memoria", thumbnail: "https://i3.ytimg.com/vi/tf7vwVsTy5k/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=tf7vwVsTy5k" }
  ],
  "Conciliación del Sueño y Descanso 😴": [
    { id: "20", title: "Música para dormir rápido y profundo", channel: "Calm", thumbnail: "https://i3.ytimg.com/vi/kF7INbdbCPA/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=tf7vwVsTy5k" },
    { id: "21", title: "Meditación para terminar el día", channel: "Mindful science", thumbnail: "https://i3.ytimg.com/vi/BTXcdQlXRJY/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=BTXcdQlXRJY" }
  ],
};

// 📌 Navbar con barra de búsqueda
const Navbar = ({ setSearchTerm }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    setSearchTerm(inputValue.trim());
  };

  return (
    <Stack
      direction="row"
      p={2}
      sx={{
        background: "rgba(0, 0, 0, 0.9)",
        top: 0,
        zIndex: 1000,
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <Typography variant="h7" sx={{ color: "white", fontWeight: "bold", ml: 1 }}>
        SECCIÓN DE VIDEOS
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <TextField
          variant="outlined"
          placeholder="Buscar..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{
            background: "white",
            borderRadius: "10px",
            width: { xs: "90px", sm: "200px", md: "250px" },
            input: { color: "black", padding: "8px" }
          }}
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon sx={{ color: "white", fontSize: 28 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

// 📌 Componente de Tarjeta de Video
const VideoCard = ({ video }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        sx={{
          width: { xs: "90%", sm: "95%", md: "320px"},
          backgroundColor: "#1E1E1E",
          cursor: "pointer",
          padding: "5px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "10px"
        }}
        onClick={() => setOpen(true)}
      >
        <Box sx={{ width: "100%", borderRadius: "10px", overflow: "hidden" }}>
          <ReactPlayer
          key={open ? video.url : ""}
            url={getEmbeddedUrl(video.url)}
            light={video.thumbnail}
            playing={false}
            controls={false}
            width="100%"
            height="auto"
            style={{ aspectRatio: "16/9", borderRadius: "10px" }}
          />
        </Box>
        <CardContent sx={{ textAlign: "center", padding: "10px", width: "100%" }}>
          <Typography variant="body1" sx={{ color: "white", fontWeight: "bold", fontSize: "14px",
              width: "100%",
              textOverflow: "ellipsis",
              wordWrap: "break-word",
              whiteSpace: "normal",
              overflow: "hidden"}}>
            {video.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "gray", fontSize: "12px" }}>
            {video.channel}
          </Typography>
        </CardContent>
      </Card>

      {/* 📌 Modal para Reproducir Video */}
      <Modal open={open} onClose={() => setOpen(false)} sx={{ display: "flex", 
        alignItems: "center", justifyContent: "center" }}>
        <Box
          sx={{
            width: "90%",
            maxWidth: "800px",
            backgroundColor: "#000",
            position: "relative",
            padding: "5px",
            borderRadius: "10px"
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" }
            }}
          >
            <CloseIcon />
          </IconButton>
          <ReactPlayer
            url={getEmbeddedUrl(video.url)}
            controls
            playing
            width="100%"
            height="auto"
            style={{ aspectRatio: "16/9" }}
          />
        </Box>
      </Modal>
    </>
  );
};

// 📌 Página Principal con Categorías
const VideoList = ({ searchTerm }) => {
  const filteredVideos = Object.entries(demoVideos).filter(
    ([category, videos]) =>
      searchTerm === "" ||
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      videos.some((video) => video.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ padding: "20px" }}>
      {filteredVideos.length > 0 ? (
        filteredVideos.map(([category, videos]) => (
          <Box key={category} p={2}>
            <Typography variant="h5" sx={{ color: "white",
                fontWeight: "bold",
                textTransform: "uppercase",
                textAlign: "center",
                textShadow: "2px 2px 5px rgba(0,0,0,0.5)",
                mb: 2,
                fontSize: { xs: "15px", sm: "20px", md: "24px", lg: "28px" } }}>
              {category}
            </Typography>
            <Swiper spaceBetween={10} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}>
              {videos.map((video) => (
                <SwiperSlide key={video.id}>
                  <VideoCard video={video} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ))
      ) : (
        <Typography sx={{ color: "white", textAlign: "center", mt: 5 }}>No se encontraron resultados</Typography>
      )}
    </Box>
  );
};

// 📌 Componente Principal (Video)
const Video = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, rgb(61, 53, 69), rgb(174, 162, 217), rgb(126, 179, 184))",
        height: "100vh", overflowX: "hidden", overflowY: "auto",
    padding: "1px", width: "100%", 
      }}
    >
      <Navbar setSearchTerm={setSearchTerm} />
      <VideoList searchTerm={searchTerm} />
    </Box>
  );
};

export default Video;
