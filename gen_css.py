color = 'var(--accent-color)'
backgroundColor = 'var(--bg-color)'

patterns = [
    f'radial-gradient(4px 100px at 0px 235px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 235px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 117.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 252px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 252px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 126px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 150px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 150px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 75px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 253px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 253px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 126.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 204px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 204px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 102px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 134px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 134px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 67px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 179px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 179px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 89.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 299px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 299px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 149.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 215px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 215px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 107.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 281px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 281px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 140.5px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 158px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 158px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 79px, {color} 100%, transparent 150%)',
    f'radial-gradient(4px 100px at 0px 210px, {color}, transparent)',
    f'radial-gradient(4px 100px at 300px 210px, {color}, transparent)',
    f'radial-gradient(1.5px 1.5px at 150px 105px, {color} 100%, transparent 150%)'
]

background_image = ", ".join(patterns)

backgroundSizes = [
    '300px 235px', '300px 235px', '300px 235px',
    '300px 252px', '300px 252px', '300px 252px',
    '300px 150px', '300px 150px', '300px 150px',
    '300px 253px', '300px 253px', '300px 253px',
    '300px 204px', '300px 204px', '300px 204px',
    '300px 134px', '300px 134px', '300px 134px',
    '300px 179px', '300px 179px', '300px 179px',
    '300px 299px', '300px 299px', '300px 299px',
    '300px 215px', '300px 215px', '300px 215px',
    '300px 281px', '300px 281px', '300px 281px',
    '300px 158px', '300px 158px', '300px 158px',
    '300px 210px', '300px 210px'
]

background_sizes = ", ".join(backgroundSizes)

startPositions = '0px 220px, 3px 220px, 151.5px 337.5px, 25px 24px, 28px 24px, 176.5px 150px, 50px 16px, 53px 16px, 201.5px 91px, 75px 224px, 78px 224px, 226.5px 230.5px, 100px 19px, 103px 19px, 251.5px 121px, 125px 120px, 128px 120px, 276.5px 187px, 150px 31px, 153px 31px, 301.5px 120.5px, 175px 235px, 178px 235px, 326.5px 384.5px, 200px 121px, 203px 121px, 351.5px 228.5px, 225px 224px, 228px 224px, 376.5px 364.5px, 250px 26px, 253px 26px, 401.5px 105px, 275px 75px, 278px 75px, 426.5px 180px'
endPositions = '0px 6800px, 3px 6800px, 151.5px 6917.5px, 25px 13632px, 28px 13632px, 176.5px 13758px, 50px 5416px, 53px 5416px, 201.5px 5491px, 75px 17175px, 78px 17175px, 226.5px 17301.5px, 100px 5119px, 103px 5119px, 251.5px 5221px, 125px 8428px, 128px 8428px, 276.5px 8495px, 150px 9876px, 153px 9876px, 301.5px 9965.5px, 175px 13391px, 178px 13391px, 326.5px 13540.5px, 200px 14741px, 203px 14741px, 351.5px 14848.5px, 225px 18770px, 228px 18770px, 376.5px 18910.5px, 250px 5082px, 253px 5082px, 401.5px 5161px, 275px 6375px, 278px 6375px, 426.5px 6480px'

css = f"""
.falling-pattern-wrapper {{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    border-radius: inherit;
}}

.falling-pattern-moving {{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    background-image: {background_image};
    background-size: {background_sizes};
    animation: fallingPatternAnim 150s linear infinite;
}}

@keyframes fallingPatternAnim {{
    0% {{ background-position: {startPositions}; }}
    100% {{ background-position: {endPositions}; }}
}}

.falling-pattern-overlay {{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(1em);
    -webkit-backdrop-filter: blur(1em);
    background-image: radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, var(--bg-color) 2px);
    background-size: 8px 8px;
    z-index: 2;
}}
"""

with open('pattern.css', 'w') as f:
    f.write(css)

# Also append it directly to style.css
with open('style.css', 'a') as f:
    f.write(css)
