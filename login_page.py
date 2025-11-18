def render_login_page(error=None):
    """Render the login page HTML"""
    error_html = f'<div class="error">{error}</div>' if error else ''
    
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - ACME</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }}
            .login-container {{
                background: #ffffff;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                width: 320px;
                animation: fadeIn 0.6s ease;
            }}
            h2 {{
                text-align: center;
                color: #1b3c78;
                margin-bottom: 25px;
                font-weight: bold;
            }}
            input {{
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #b5d0ff;
                border-radius: 6px;
                box-sizing: border-box;
                font-size: 14px;
                background: #f5f9ff;
            }}
            input:focus {{
                outline: none;
                border-color: #4facfe;
                background: #eef5ff;
                box-shadow: 0 0 5px rgba(79,172,254,0.4);
            }}
            button {{
                width: 100%;
                padding: 12px;
                background: #1e6ffb;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 10px;
                transition: background 0.25s, transform 0.1s;
            }}
            button:hover {{
                background: #155bd1;
            }}
            button:active {{
                transform: scale(0.98);
            }}
            .error {{
                color: #d93025;
                font-size: 14px;
                margin-top: 15px;
                text-align: center;
                padding: 10px;
                background: #ffe5e5;
                border: 1px solid #ffbcbc;
                border-radius: 6px;
            }}

            @keyframes fadeIn {{
                from {{ opacity: 0; transform: translateY(10px); }}
                to {{ opacity: 1; transform: translateY(0); }}
            }}
        </style>
    </head>
    <body>
        <div class="login-container">
            <h2>ACME Login</h2>
            <form method="POST" action="/login">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            {error_html}
        </div>
    </body>
    </html>
    '''
