import React, { useState } from 'react';
import Title from './Title';
import { Input } from '@material-ui/core';
import axios from 'axios';

export default function SQLinput({ vertices, setVertices }) {
  const [input, setInput] = useState();

  const onChange = (e) => {
    setInput(e.target.value);
  }

  const keyPress = (e) => {
    if(e.key === "Enter") {
      alert("누르지마");
    }
  }

  return (
    <>
      <Title >
        <Input 
          placeholder = "input"
          value = {input} 
          onChange = { onChange } 
          style = {{ width: "60%" }} 
          onKeyPress = { keyPress }>
        </Input>
      </Title>
    </>
  );
}