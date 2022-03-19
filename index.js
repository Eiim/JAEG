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
	const status = document.getElementById("toImageStatus");
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
			aspect = 1.0*document.getElementById("aspect").value;
			imgwidth = Math.ceil(Math.sqrt(aspect*audioarr.length));
			imgheight = Math.ceil(Math.sqrt(audioarr.length/aspect));
			console.log(imgwidth+"x"+imgheight);
			status.textContent = "Converting to image data";
			imgarr = new Uint8ClampedArray(imgheight*imgwidth*4);
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
			canvas.width = imgwidth;
			canvas.height = imgheight;
			var idata = ctx.createImageData(imgwidth, imgheight);
			idata.data.set(imgarr);
			ctx.putImageData(idata, 0, 0);
			status.textContent = "Compressing to JPEG";
			quality = 1.0*document.getElementById("quality").value;
			imageConversion.canvastoFile(canvas, quality, "image/jpeg").then(file => {
				/*status.textContent = "Adding custom flags";
				var jaegFlags = {};
				jaegFlags[0] = 0; // JAEFType
				jaegFlags[1] = audiobuf.sampleRate; // Sample rate
				jaegFlags[2] = imgwidth*imgheight - audioarr.length; // Extra samples
				var exifStr = piexif.dump({JAEG: jaegFlags});
				console.log(file);
				file = piexif.insert(exifStr, file);
				console.log(file);*/
				
				status.textContent = "Downloading";
				origName = document.getElementById('sourceAudio').files[0].name;
				newName = origName.substring(0, origName.lastIndexOf("."))+".jpeg";
				imageConversion.downloadFile(file, newName);
				status.textContent = "Done!";
			});
		})
	});
}
function convertImage() {
	const status = document.getElementById("toAudioStatus");
	status.textContent = "Initializing";
	const image = document.getElementById('sourceImage').files[0];
	status.textContent = "Parsing image";
	imageConversion.filetoDataURL(image).then(dataurl => {
		status.textContent = "Conversion step 1";
		imageConversion.dataURLtoImage(dataurl).then(imageobj => {
			status.textContent = "Conversion step 2";
			imageConversion.imagetoCanvas(imageobj).then(canvas => {
				status.textContent = "Processing image data";
				ctx = canvas.getContext('2d');
				imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
				
				status.textContent = "Converting to audio data";
				buffer = new Float32Array(imgdata.length/4);
				for(i = 0; i < imgdata.length; i += 4) {
					darkness = (imgdata[i]+imgdata[i+1]+imgdata[i+2])/3
					buffer[i/4] = (darkness-128)/128
				}
				
				status.textContent = "Encoding audio data";
				encoder = new WavAudioEncoder(44100, 1);
				encoder.encode([buffer]);
				blob = encoder.finish();
				
				status.textContent = "Downloading";
				origName = document.getElementById('sourceImage').files[0].name;
				newName = origName.substring(0, origName.lastIndexOf("."))+".wav";
				saveAs(blob, newName);
				status.textContent = "Done!";
			})
		})
	})
}