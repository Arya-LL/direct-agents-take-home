# Default instructions from next.js for running this code locally

Below are the instructions for running this app locally. I over-explain the necessary steps, but I skipped on details for some of these steps because the step is platform specific.

- Download this repository by downloading the zip file (steps below)
  - Click the green code button above
  - A popup window will appear. The bottom-most portion of it will have a "Download ZIP" button. Click this button to download the code
  - Unzip the folder
  - Open the .env file in notepad or your text editor of choice
  - In that .env file, replace "INSERT_KEY_HERE" with the API key that I emailed Lauren Goldstein
    - I did not include the API key myself for security reasons
- Run the development server by opening a terminal in that now unzipped folder (instructions for this varies by operating system)
  - type one of the below commands in a terminal:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

- the first of the four commands above is probably the one you will want to use
- One of the four packages listed above need to be installed on the system you are running this from (npm, yarn, pnpm, bun)

## Opening on the same device that is running the server

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Opening on another device that is connected to the same network as the server

After running one of the above commands, some text like the following will appear:
\> take-home-assessment@0.1.0 dev
\> next dev --turbopack

▲ Next.js 15.3.4 (Turbopack)

- Local: http://localhost:3000
- Network: http://192.168.1.215:3000
- Environments: .env

✓ Starting...
✓ Ready in 643ms

On another device, open a browser and go to the link next to the "Network" section from the above output

# Notes

I set a budget limit of $10 on the google cloud platform project associated with the api key in this repository. If this budget is reached, the project corresponding to the api key will shut down, causing the chatbot to only reply with API errors. Please let me know if this is happening and I will increase the budget. I don't anticipate this happening, but I placed the limit anyway to prevent runaway costs in the case of infinite/repeating calls.
