document.getElementById('url-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const urls = document.getElementById('url').value.split('\n');
  const urlArray = urls.map(url => url.trim()).filter(url => url !== '');
  const ws = new WebSocket('ws://192.168.68.132:3000');
  ws.onopen = () => {
    console.log('WebSocket connection opened');
    ws.send(urlArray.join('\n'));  // Send URLs only
  };
  ws.onmessage = (message) => {
    console.log('Received output:', message.data);
    if(message.data instanceof Blob) {
      var reader = new FileReader();
      reader.onload = function() {
        document.getElementById('output').innerHTML = reader.result;
      }
      reader.readAsText(message.data);
    } else {
      document.getElementById('output').innerHTML = message.data;
    }
  };
  ws.onerror = (error) => {
    console.log('WebSocket error: ', error);
  };
});
