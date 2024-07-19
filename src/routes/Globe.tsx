export default function Globe() {
  return (
    <ContextProvider>
      <Canvas gl={{ antialias: true }} className="bg-black">
        <PerspectiveCamera makeDefault position={[10, 10, 0]} />
        <Controls />
        <ambientLight color={0xffffff} intensity={2} />
        <Cities />
        <Earth />
        <EarthWireframe />
        <Stars />
        <Curves />
      </Canvas>
      <UIWrapper />
    </ContextProvider>
  );
}
