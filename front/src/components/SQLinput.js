import React, { useState } from 'react';
import Title from './Title';
import { Input } from '@material-ui/core';
import axios from 'axios';

export default function SQLinput({ vertices, setVertices }) {
  const [input, setInput] = useState("");
  const options = ["-V", "-h"];

  const onChange = (e) => {
    setInput(e.target.value);
  }

  const keyPress = (e) => {
    if(e.key === "Enter") {
      if(input === "") {
        alert("명령어를 입력하세요");
        return;
      }

      let parsing = input.split(" ");

      // 커맨드가 GV로 시작하지 않는 경우 or 형식에 맞지 않는 경우
      if(parsing[0] !== "GV" || parsing.length%2 !== 1) {
        alert("잘못된 입력힙니다");
        return;
      }

      // 커맨드가 GV로 시작하는 경우
      else {
        // 옵션체크
        for(let i=1; i<parsing.length; i++) {
          if(i%2 === 1 && options.indexOf(parsing[i]) === -1) {
            alert("옵션을 확인해주세요");
            return;
          }
        }

        // requset params
        const request = [];

        // 파라미터 추출
        for(let i=1; i<parsing.length; i++) {
          // -V 옵션의 경우
          if(i%2 === 1 && options.indexOf(parsing[i]) === 0)
            request.push({ "vertex": parsing[i+1] })
          // -h 옵션의 경우
          else if(i%2 === 1 && options.indexOf(parsing[i]) === 1)
            request.push({ "hop": parsing[i+1] })
        }
        
        // 서버에 요청
        axios.get("/api/sqlInput", {
          params: request
        }).then((res) => {
          console.log(res);
        })

      }
    }
  }

  return (
    <>
      <Title >
        <Input 
          placeholder = "input"
          value = { input } 
          onChange = { onChange } 
          style = {{ width: "60%" }} 
          onKeyPress = { keyPress }>
        </Input>
      </Title>
    </>
  );
}