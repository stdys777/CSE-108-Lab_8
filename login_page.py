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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }}
            .login-container {{
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                width: 300px;
            }}
            h2 {{
                text-align: center;
                color: #333;
                margin-bottom: 30px;
            }}
            input {{
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-sizing: border-box;
                font-size: 14px;
            }}
            input:focus {{
                outline: none;
                border-color: #667eea;
            }}
            button {{
                width: 100%;
                padding: 12px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 10px;
                transition: background 0.3s;
            }}
            button:hover {{
                background: #5568d3;
            }}
            .error {{
                color: #e74c3c;
                font-size: 14px;
                margin-top: 15px;
                text-align: center;
                padding: 10px;
                background: #ffe6e6;
                border-radius: 5px;
            }}
            .info {{
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 15px;
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