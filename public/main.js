document.addEventListener('DOMContentLoaded', () => {
    const threadsContainer = document.getElementById('threads-container');
    const threadForm = document.getElementById('thread-form');

    // Function to fetch and display threads
    async function fetchThreads() {
        try {
            const response = await fetch('/api/threads');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const threads = await response.json();
            threadsContainer.innerHTML = ''; // Clear existing threads
            threads.forEach(thread => {
                const threadItem = document.createElement('div');
                threadItem.classList.add('thread-item');
                threadItem.innerHTML = `
                    <h3>${thread.title}</h3>
                    <div class="meta">by ${thread.name} on ${new Date(thread.created_at).toLocaleString()}</div>
                    <p class="content">${thread.content}</p>
                    ${thread.image ? `<img src="${thread.image}" alt="Thread Image">` : ''}
                `;
                threadsContainer.appendChild(threadItem);
            });
        } catch (error) {
            console.error('Error fetching threads:', error);
            threadsContainer.innerHTML = '<p>Failed to load threads.</p>';
        }
    }

    // Function to handle new thread submission
    threadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const image = document.getElementById('image').value;

        try {
            const response = await fetch('/api/threads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, title, content, image }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            alert('Thread posted successfully!');
            threadForm.reset(); // Clear the form
            fetchThreads(); // Reload threads
        } catch (error) {
            console.error('Error posting thread:', error);
            alert(`Failed to post thread: ${error.message}`);
        }
    });

    // Initial fetch of threads when the page loads
    fetchThreads();
});