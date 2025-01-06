import { Style, css } from "hono/css";
import { html } from "hono/html";
import type { PropsWithChildren } from "hono/jsx";

export const Layout = (props: PropsWithChildren<{ title: string }>) => {
	return html`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/diun.png" />
        <title>${props.title}</title>
        ${(
					<Style>{css`
            html {
              font-family: Arial, Helvetica, sans-serif;
            }

            button {
              background-color: rgb(0 0 0 / 0.6);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              cursor: pointer;
            }

            button:hover {
              background-color: rgb(0 0 0 / 0.8);
            }

            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            :not(body) >  header {
              margin-top: 1.5rem;
            }

            h1,h2,h3 {
              margin: 0;
            }
            
            h2 {
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }

            header > div {
              display: flex;
              gap: 1rem;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 0.5rem;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }

            td.actions div {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 0.5rem;
            }

            tr:nth-child(even) {
              background-color: #f2f2f2;
            }

            td a button {
              background-color: #71717a;
            }
          `}</Style>
				)}
      </head>
      <body style="padding: 1em 2em">
        <div id="root"></div>
        ${props.children}
      </body>
    </html>`;
};
