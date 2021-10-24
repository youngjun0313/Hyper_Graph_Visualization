import React, { useState } from 'react';
import Title from './Title';
import { Input } from '@material-ui/core';
import axios from 'axios';

export default function SQLinput({ vertices, setVertices }) {
  const [input, setInput] = useState("");
  const options = ["-V", "-h", "-HE"];

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

      // 커맨드가 GV로 시작하지 않는 경우
      if(parsing[0] !== "GV") {
        alert("잘못된 입력힙니다");
        return;
      }

      // 커맨드가 GV로 시작하는 경우
      else {
        // 옵션체크
        for(let i=1; i<parsing.length; i++) {
          if(parsing[i][0] === "-" && options.indexOf(parsing[i]) === -1) {
            alert("옵션을 확인해주세요");
            return;
          }
        }

        // requset params
        const request = {};

        // 파라미터 추출
        for(let i=1; i<parsing.length; i++) {
          // -V 옵션의 경우
          if(options.indexOf(parsing[i]) === 0) {
            // input parsing
            if(parsing[i+1][0] === '"') {
              let tempString = "";
              for(let j=i+1; j<parsing.length; j++) {
                if(parsing[j][0] === '"' && parsing[j][parsing[j].length-1] === '"') {
                  tempString = parsing[j].substring(1, parsing[j].length-1);
                  break;
                } else if(parsing[j][parsing[j].length-1] === '"') {
                  tempString += " " + parsing[j].substring(0, parsing[j].length-1)
                  break;
                } else if(parsing[j][0] === '"') {
                  tempString = parsing[j].substring(1);
                } else {
                  tempString += " " + parsing[j];
                }
              }
              console.log("temp String is : " + tempString);
              request.vertex = tempString;
            } else {
              request.vertex = parsing[i+1];
            }
          }
          // -h 옵션의 경우
          else if(options.indexOf(parsing[i]) === 1)
            request.hop = parsing[i+1];
          // -HE 옵션의 경우
          else if(options.indexOf(parsing[i]) === 2) {
            // input parsing
            if(parsing[i+1][0] === '"') {
              let tempString = "";
              for(let j=i+1; j<parsing.length; j++) {
                if(parsing[j][0] === '"' && parsing[j][parsing[j].length-1] === '"') {
                  tempString = parsing[j].substring(1, parsing[j].length-1);
                  break;
                } else if(parsing[j][parsing[j].length-1] === '"') {
                  tempString += " " + parsing[j].substring(0, parsing[j].length-1)
                  break;
                } else if(parsing[j][0] === '"') {
                  tempString = parsing[j].substring(1);
                } else {
                  tempString += " " + parsing[j];
                }
              }
              request.hyperedge = tempString;
            } else {
              request.hyperedge = parsing[i+1];
            }
          }
        }
        
        // 서버에 요청
        axios.get("/api/sqlInput", {
          params: request
        }).then((res) => {
          setVertices(res.data);
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