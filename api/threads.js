export default function handler(req, res) {
    if (req.method === 'POST') {
        const { text, imageData } = req.body;

        // In a real application, you would use the Threads API here.
        // For this example, we'll just log the data to the server console.
        console.log("Received data for new thread post:");
        console.log("Text:", text);
        console.log("Image Data (first 100 chars):", imageData.substring(0, 100) + "...");

        res.status(200).json({ message: 'Data received successfully. Check server logs.' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
