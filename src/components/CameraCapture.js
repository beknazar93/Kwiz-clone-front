import React, { useState, useRef } from "react";

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL("image/png");
    onCapture(photo);
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="300" height="300" />
      <button onClick={startCamera}>Включить камеру</button>
      <button onClick={takePhoto}>Сделать фото</button>
    </div>
  );
};

export default CameraCapture;
