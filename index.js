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
	const baseAudioContext = new AudioContext();
	const audio = document.getElementById('sourceAudio').files[0];
	audio.arrayBuffer().then(buffer => {
		baseAudioContext.decodeAudioData(buffer).then(audiobuf => {
			audioarr = audiobuf.getChannelData(0);
			max = 0;
			for(a of audioarr){if (Math.abs(a) > max){max = Math.abs(a)}}
			imgdim = Math.ceil(Math.sqrt(audioarr.length));
			console.log(imgdim);
			imgarr = new Uint8ClampedArray((imgdim**2)*4);
			imgarr.fill(255);
			for(i in audioarr){
				darkness = ((audioarr[i]/max)+1)*128;
				imgarr[4*i] = darkness;
				imgarr[4*i+1] = darkness;
				imgarr[4*i+2] = darkness;
				imgarr[4*i+3] = 255;
			}
			console.log(imgarr);
			// imgarr has RGBA values
			var canvas = document.createElement('canvas');
			ctx = canvas.getContext('2d');
			canvas.width = imgdim;
			canvas.height = imgdim;
			var idata = ctx.createImageData(imgdim, imgdim);
			idata.data.set(imgarr);
			ctx.putImageData(idata, 0, 0);
			imageConversion.canvastoFile(canvas, .5, "image/jpeg").then(file => {
				imageConversion.downloadFile(file);
			});
		})
	});
	
	/*imageConversion.compress(file,0.25).then(res=>{
		console.log(res);
	})*/	
}
function convertImage() {
	
}