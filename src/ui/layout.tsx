import { Style, css } from 'hono/css';
import { html } from 'hono/html';

export const Layout = (props: { title: string; children?: any }) => {
  return html`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            h1 {
              margin: 0;
            }

            header > div {
              display: flex;
              gap: 1rem;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-top: 1rem;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }

            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
          `}</Style>
        )}
      </head>
      <body style="padding: 1em 2em">
        ${props.children}
      </body>
    </html>`;
};
