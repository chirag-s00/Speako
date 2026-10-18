export function useReelSpin({reel, filter, sound, onSpinStart}: Args){
    const [pos, setPos] = useState(0);
    const [filter, setFilter] = useState<string>(RANDOM);
    const [spinning, setSpinning] = useState(false);
    const [landed, setLanded] = useState(true);
    const raf = useRef<number>(0);
    const posRef = useRef(0);

    const reel = useMemo(() => buildReel(mode), [mode]);
    const n = reel.length;
    const current = at(reel, Math.round(pos));
    const cats = Object.keys(DATA[mode].categories);

    const handleRecordingToggle = useCallback(() => {
        if (spinning || isUploading) return;
    
        sound.unlock();
    
        if (speaking) {
          stop();
          return;
        }
    
        setUploadedKey(null);
        setUploadError(null);
    
        start();
      }, [spinning, isUploading, speaking, sound, start, stop]);


}