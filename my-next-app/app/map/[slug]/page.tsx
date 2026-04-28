'use client';

import { 
    use, 
    useState,
    createContext,
    useContext,
    useMemo,
    useEffect
} from "react";
import Image from "next/image";

interface ThumbnailCardProps {
  id:string;
  title: string;
  budget: string;
  description: string;
  image: string;
  order: string;
}

interface SelectedContext {
  selected: ThumbnailCardProps | null;
  setSelected: (value: ThumbnailCardProps | null) => void;
}

const PanelContext = createContext<{
  enable: boolean;
  setEnable: (value: boolean) => void;
}>({ enable: true, setEnable: () => {} });

const SelectedContext = createContext<SelectedContext>({
  selected: null,
  setSelected: () => {},
});

function CloseButton(){
    const [hovered,setHovered] = useState<boolean>(false)
    const {setEnable} = useContext(PanelContext)

    const enableHover = () => {
        setHovered(true)
    }

    const disableHover = () => {
        setHovered(false)
    }
    return (
        <button
            onMouseEnter={enableHover}
            onMouseLeave={disableHover}
            className="cursor-pointer"
            onClick={()=>setEnable(false)}
        >
            <Image
                alt="close"
                src={hovered ? "/close-active.svg" : "/close.svg"}
                width={25}
                height={25}
            />
        </button>
    )
}

function OpenButton(){
    const [hovered,setHovered] = useState<boolean>(false)
    const {setEnable} = useContext(PanelContext)

    const enableHover = () => {
        setHovered(true)
    }

    const disableHover = () => {
        setHovered(false)
    }
    return (
        <button
            onMouseEnter={enableHover}
            onMouseLeave={disableHover}
            className="cursor-pointer"
            onClick={()=>setEnable(true)}
        >
            <Image
                alt="menu"
                src={hovered ? "/menu-active.svg" : "/menu.svg"}
                width={20}
                height={20}
                className="bg-white rounded-3xl px-2 py-2 w-fit h-fit"
            />
        </button>
    )
}

function SmallCloseButton(){
    const [hovered,setHovered] = useState<boolean>(false)

    const enableHover = () => {
        setHovered(true)
    }

    const disableHover = () => {
        setHovered(false)
    }
    return (
        <button
            onMouseEnter={enableHover}
            onMouseLeave={disableHover}
            className="cursor-pointer"
        >
            <Image
                alt="close"
                src={hovered ? "/close-active.svg" : "/close.svg"}
                width={20}
                height={20}
            />
        </button>
    )
}

function DescriptionCloseButton() {
  const [hovered, setHovered] = useState<boolean>(false);
  const { setSelected } = useContext(SelectedContext);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setSelected(null)}
      aria-label="Close description"
      className="absolute top-4 right-2 cursor-pointer"
    >
      <Image
        alt="close"
        src={hovered ? "/close-active.svg" : "/close.svg"}
        width={18}
        height={18}
        className="bg-white rounded-full px-2 py-2 w-fit h-fit"
      />
    </button>
  );
}

function DescriptionCard() {
  const { selected } = useContext(SelectedContext);

  if (!selected) return null;

  return (
    <aside
      className="
        absolute top-4 bg-white rounded-2xl
        w-[22vw] h-fit flex flex-col
        shadow-lg overflow-hidden
        transition-all duration-300
      "
      style={{ left: "calc(20vw + 2rem)" }}
    >
      <div className="relative w-full h-60">
        <Image
          alt={selected.title}
          src={selected.image}
          fill
          className="object-cover"
        />
        <DescriptionCloseButton />
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1 custom-scroll">
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl font-medium truncate text-black">{selected.title}</h4>
          <p className="text-lg font-medium text-[#424242]">{selected.budget}</p>
          <p className="text-sm font-medium text-[#424242] leading-relaxed">{selected.description}</p>
        </div>
      </div>
    </aside>
  );
}

function ThumbnailCard({ id, title, budget, description, image, order }: ThumbnailCardProps) {
  const { selected, setSelected } = useContext(SelectedContext);
  const isSelected = selected?.id === id;

  return (
    <article
      onClick={() => setSelected(isSelected ? null : { id, title, budget, description, image }<ThumbnailCardProps>)}
      className={`
        flex flex-col gap-3 w-full h-fit p-3 cursor-pointer
        hover:bg-[#eeeeee]
        ${isSelected ? "bg-[#eeeeee]" : "bg-white"}
      `}
    >
      <header className="flex justify-end items-center">
        <SmallCloseButton />
      </header>
      <div className={`flex gap-4 items-start ${isSelected ? "text-black" : "text-[#757575]"} hover:text-black`}>
        <span className="text-lg font-medium text-[#424242]">{order}</span>
        <div className={`flex flex-col flex-1`}>
          <h4 className="text-xl font-semibold truncate">{title}</h4>
          <p className="text-lg font-medium line-clamp-2">{budget}</p>
          <p className="text-sm font-medium leading-relaxed line-clamp-2">{description}</p>
        </div>
        <Image
          alt={`${title} thumbnail`}
          src={image}
          width={100}
          height={100}
          className="rounded-xl object-cover shrink-0 w-[100px] h-[100px]"
          decoding="async"
        />
      </div>
    </article>
  );
}

export default function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [enable, setEnable] = useState<boolean>(true);
  const [selected, setSelected] = useState<ThumbnailCardProps | null>(null);
  const [data,setData] = useState({})
  useEffect(()=>{
    const loadData = async() =>{
      const destinationJSON = await import("@/json/test-panel.json")
      setData(destinationJSON.default)
    }

    loadData();
  },[])

  const budget = useMemo(() => {
    const cost = Object.values(data).reduce((sum, dest) => sum + (dest as any).budget, 0);
    const strCost = cost.toString();

    let result = ""
    let count = 0
    for (let i = strCost.length - 1; i>=0; i--){
      count++;
      result = strCost[i] + result;

      if (count % 3 == 0 && i != 0){
        result = "," + result
      }
    }

    return "$" + result
  }, [data]);

  return (
    <PanelContext value={{ enable, setEnable }}>
      <SelectedContext value={{ selected, setSelected }}>

        {!enable && (
          <div className="absolute top-4 left-4">
            <OpenButton />
          </div>
        )}

        {enable && (
          <main className="h-[80vh] absolute bg-white rounded-2xl w-[20vw] flex flex-col top-4 left-4">
            <header className="flex justify-between p-4 border-b border-gray-400">
              <h3 className="text-xl font-medium">{data["hk"]?.title}</h3>
              <CloseButton />
            </header>

            <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 custom-scroll">
              {Object.values(data).map((dest) => (
                <ThumbnailCard
                  key={dest.id}
                  order={String(dest.order)}
                  id={dest.id}
                  title={dest.title}
                  budget={`$${dest.budget.toLocaleString()}`}
                  description={dest.description}
                  image={dest.image}
                />
              ))}
            </div>

            <footer className="flex justify-end p-4 border-t border-gray-400">
              <p className="text-sm font-semibold text-[#006064]">Total Budget: {budget as unknown as ReactNode}</p>
            </footer>
          </main>
        )}

        <DescriptionCard />

      </SelectedContext>
    </PanelContext>
  );
}