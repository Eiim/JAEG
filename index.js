/*
Copyright 2021 Eiim and/or contributors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
function convertAudio() {
	const status = document.getElementById("status");
	status.textContent = "Initializing";
	const baseAudioContext = new AudioContext();
	const audio = document.getElementById('sourceAudio').files[0];
	status.textContent = "Buffering file";
	audio.arrayBuffer().then(buffer => {
		status.textContent = "Decoding audio";
		baseAudioContext.decodeAudioData(buffer).then(audiobuf => {
			status.textContent = "Processing audio";
			audioarr = audiobuf.getChannelData(0);
			if(audioarr.length >= 2**30) {
				status.textContent = "Error: audio too long";
				return;
			}
			max = 0;
			for(a of audioarr){if (Math.abs(a) > max){max = Math.abs(a)}}
			imgdim = Math.ceil(Math.sqrt(audioarr.length));
			console.log(imgdim);
			status.textContent = "Converting to image data";
			imgarr = new Uint8ClampedArray((imgdim**2)*4);
			imgarr.fill(255);
			for(i in audioarr){
				darkness = ((audioarr[i]/max)+1)*128;
				imgarr[4*i] = darkness;
				imgarr[4*i+1] = darkness;
				imgarr[4*i+2] = darkness;
				imgarr[4*i+3] = 255;
			}
			// imgarr has RGBA values
			status.textContent = "Setting up canvas";
			var canvas = document.createElement('canvas');
			ctx = canvas.getContext('2d');
			canvas.width = imgdim;
			canvas.height = imgdim;
			var idata = ctx.createImageData(imgdim, imgdim);
			idata.data.set(imgarr);
			ctx.putImageData(idata, 0, 0);
			status.textContent = "Compressing to JPEG";
			imageConversion.canvastoFile(canvas, .5, "image/jpeg").then(file => {
				status.textContent = "Downloading";
				origName = document.getElementById('sourceAudio').files[0].name;
				newName = origName.substring(0, origName.lastIndexOf("."))+".jpeg";
				imageConversion.downloadFile(file, newName);
				status.textContent = "Done!";
			});
		})
	});
	
	/*imageConversion.compress(file,0.25).then(res=>{
		console.log(res);
	})*/	
}
function convertImage() {
	
}