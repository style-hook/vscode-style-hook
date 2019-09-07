function Component() {
  const className = useStyle `
    color: #202020;
    background: #f0f0f0;
    font-size: 20px;
    transition: all .5s;
    :hover {
      transform: scale(1.2);
    }
  `
  return <div className={className}>hello world</div>
}
