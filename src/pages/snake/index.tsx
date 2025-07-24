
import { useRef, useEffect, useState } from 'react';
import Snake from './snake';

interface SnakePanelProps {
    snake?: Snake.Snake | undefined,
    milisecond?: number | undefined,
    callback?: (result: string) => void;
}

function SnakePanel({ snake, milisecond = 100, callback = (result: string) => { } }: SnakePanelProps) {
    let _cellSizeRef = useRef(10);
    let _cellCountXRef = useRef(50);
    const _cellCountY: number = 50;

    // reference of canvas and its parent
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasParentRef = useRef<HTMLDivElement>(null);

    // state
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [_snake, setSnake] = useState<Snake.Snake | undefined>(snake);
    const [eatenCoin, setEatenCoin] = useState<boolean>(false);

    useEffect(() => {
        // create a snake
        let snake = Snake.createSnake(52, 2, 30);
        let vectors = [];
        for (var i = 0; i < 52; i++) {
            if (i > 30) {
                vectors.push(2)
            } else if (i > 12) {
                vectors.push(3)
            } else {
                vectors.push(0)
            }
        }
        snake = Snake.setSnakeVectors(snake, vectors);
        setSnake(snake);

        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };

        // resive event
        window.addEventListener('resize', handleResize);

        // timer for moving snake
        const interval = setInterval(() => {
            // define next position of snake
            const nextVector: number = 1;
            setSnake(Snake.move(snake, nextVector));

            // compare if snake take the coin (as default, coin position is (60, 30).)
            if (snake.x === (_cellCountXRef.current - 5) && snake.y === 30) {
                setEatenCoin(true);
            } else if ((snake.x <= 0 || snake.x >= _cellCountXRef.current) || (snake.y <= 0 || snake.y >= _cellCountY)) {
                callback('out');
            }

        }, milisecond);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    }, [callback, milisecond]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasParent = canvasParentRef.current;

        if (canvas && canvasParent) {
            const { width, height } = canvasParent.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;

            // define cell size
            _cellSizeRef.current = Math.floor(height / _cellCountY);
            const cellSize = _cellSizeRef.current;
            _cellCountXRef.current = Math.floor(width / cellSize) + 1;

            const context = canvas.getContext('2d');
            if (context) {
                // Example: Clear canvas and draw a rectangle
                context.clearRect(0, 0, canvas.width, canvas.height);

                // render snake
                if (_snake) {
                    let index_x: number = _snake.x
                    let index_y: number = _snake.y

                    _snake.nodes.forEach(node => {
                        context.fillStyle = node.color
                        if (node.index === 0) { // header
                            context.fillRect(index_x * cellSize - cellSize / 2 - 1, index_y * cellSize - cellSize / 2 - 1, cellSize * 2 - 2, cellSize * 2 - 2)
                            if (node.vector === 0) { // bottom
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize - 1, cellSize - 2, cellSize * 1.8 - 2)
                            } else if (node.vector === 2) { // top
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize - cellSize - 1, cellSize - 2, cellSize * 1.8 - 2)
                            } else if (node.vector === 3) { // left
                                context.fillRect(index_x * cellSize - cellSize - 1, index_y * cellSize - 1, cellSize * 1.8 - 2, cellSize - 2)
                            } else if (node.vector === 1) { // right
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize - 1, cellSize * 2 - 1.8, cellSize - 2)
                            }
                        } else if (node.index === _snake.node_count - 1) { // tail
                            if (node.vector === 0) { // bottom
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize + cellSize / 2 - 1, cellSize - 2, cellSize / 2 - 2)
                            } else if (node.vector === 2) { // top
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize - 1, cellSize - 2, cellSize / 2 - 2)
                            } else if (node.vector === 3) { // left
                                context.fillRect(index_x * cellSize - 1, index_y * cellSize - 1, cellSize / 2 - 2, cellSize - 2)
                            } else if (node.vector === 1) { // right
                                context.fillRect(index_x * cellSize + cellSize / 2 - 1, index_y * cellSize - 1, cellSize / 2 - 2, cellSize - 2)
                            }
                        } else { // body
                            context.fillRect(index_x * cellSize - 1, index_y * cellSize - 1, cellSize - 2, cellSize - 2)
                        }

                        // change the position of next node
                        if (node.vector === 0) { // bottom
                            index_y--;
                        } else if (node.vector === 1) { // right
                            index_x--;
                        } else if (node.vector === 2) { // top
                            index_y++;
                        } else if (node.vector === 3) { // left
                            index_x++;
                        }
                    })
                }

                // render coin
                if (!eatenCoin) {
                    const img = new Image();
                    img.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${cellSize * 2}" height="${cellSize * 2}" viewBox="0 0 40 40" fill="none">
                        <rect x="3.27283" y="2.90906" width="33.8182" height="33.8182" fill="#FFEE00"/>
                        <rect x="5.45447" width="29.0909" height="40" fill="#FFEE00"/>
                        <rect y="6.90906" width="40" height="26.1818" fill="#FFEE00"/>
                        <path d="M17.4088 15V12.2727H20.1361V9.54542H22.8634V12.2727H25.5907V15H17.4088ZM17.4088 28.6363V25.9091H14.6816V23.1818H22.8634V20.4545H17.4088V17.7272H14.6816V15H17.4088V17.7272H22.8634V20.4545H25.5907V23.1818H22.8634V25.9091H20.1361V28.6363H17.4088Z" fill="black"/>
                    </svg>`)}`; // Convert SVG string to base64
                    context.drawImage(img, (_cellCountXRef.current - 5) * cellSize - cellSize / 2, 30 * cellSize - cellSize / 2);
                }
            }
        }
    }, [size, _snake, eatenCoin]);

    return (
        <div className='w-100 h-100' ref={canvasParentRef}>
            <canvas ref={canvasRef}>Sorry, your browser doesn't support canvas.</canvas>
        </div>
    );
}

export default SnakePanel;
