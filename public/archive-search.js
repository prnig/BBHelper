let isLoading = false;
let lastScrollTop = 0;

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // you're at the bottom of the page, fetch more data
        if (!isLoading) {
            isLoading = true;
            const domain = document.getElementById('domainInput').value;
            fetchMoreData(domain).then(() => {
                isLoading = false;
            });
        }
    }
};

async function fetchMoreData(domain) {
  // Fetch more data and append it to your page
  fetch(`/archive-search?domain=${domain}`)
    .then(response => {
      const reader = response.body.getReader();
      reader.read().then(function processText({ done, value }) {
        if (done) {
          console.log('Stream complete');
          return;
        }
        
        const result = new TextDecoder("utf-8").decode(value);
        const lines = result.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('data: ')) {
            const url = lines[i].substring(6); // Remove "data: " prefix
            const responseElement = document.getElementById('response');
            responseElement.innerHTML += `<a href="${url}" target="_blank" class="url">${url}</a><br>`;
          }
        }

        return reader.read().then(processText);
      });
    })
    .catch(error => {
      console.error(error);
    });
}
