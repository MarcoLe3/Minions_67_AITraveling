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
import { set } from "date-fns";

interface ThumbnailCardProps {
  id:number;
  title: string;
  budget: string;
  description: string;
  image: string;
  order: string;
}

interface Destination {
  id: string;
  order: number;
  title: string;
  budget: number;
  description: string;
  image: string;
  route: {
    origin: { label: string; lat: number; lng: number };
    destination: { label: string; lat: number; lng: number };
  };
}

interface SelectedContext {
  selected: ThumbnailCardProps | null;
  setSelected: (value: ThumbnailCardProps | null) => void;
  removeSelected: (id: number) => void;
}

const PanelContext = createContext<{
  enable: boolean;
  setEnable: (value: boolean) => void;
}>({ enable: true, setEnable: () => {} });

const SelectedContext = createContext<SelectedContext>({
  selected: null,
  setSelected: () => {},
  removeSelected: () => {}
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

function SmallCloseButton({ id }: { id: number }) {
  const [hovered, setHovered] = useState(false);
  const { removeSelected } = useContext(SelectedContext);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        removeSelected(id);
      }}
      className="cursor-pointer"
    >
      <Image
        alt="close"
        src={hovered ? "/close-active.svg" : "/close.svg"}
        width={20}
        height={20}
      />
    </button>
  );
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

//TODO: fix the title and image
function DescriptionCard() {
  const { selected } = useContext(SelectedContext);

  const cleanedSelected = useMemo(() => {
    if (!selected) return null;
    return {
      ...selected,
      description: Array.isArray(selected.description)
        ? selected.description.filter((desc: string) => { return desc.trim() !== "" && desc !== "Activities:"; })
        : selected.description
    };
  }, [selected]);

  return (
    <aside
      className="
        absolute top-4 bg-white rounded-2xl w-100 h-110 flex flex-col
        shadow-lg overflow-hidden
        transition-all duration-300
      "
      style={{ left: "calc(350px + 2rem)" }}
    >
      <div className="relative w-full h-60">
        <Image
          alt="dummy"
          src={cleanedSelected?.image || ""}
          fill
          className="object-cover"
          decoding="async"
        />
        <DescriptionCloseButton />
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1 custom-scroll">
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl font-medium truncate text-black">{cleanedSelected?.title}</h4>
          <p className="text-lg font-medium text-[#424242]">{cleanedSelected?.budget}</p>
          <p className="text-sm font-medium text-[#424242] leading-relaxed">{cleanedSelected?.description}</p>
        </div>
      </div>
    </aside>
  );
}

//TODO: add title and image
function ThumbnailCard({ title, id, budget, description, order, image }: ThumbnailCardProps) {
  const { selected, setSelected } = useContext(SelectedContext);
  const isSelected = selected?.id === id;

  const cleanedDescription = useMemo(() => {
    return Array.isArray(description)
      ? description.filter((desc: string) => { return desc.trim() !== "" && desc !== "Activities:"; })
      : description;
  }, [description]);

  return (
    <article
      onClick={() => setSelected(isSelected ? null : { title, id, budget, description, order, image })}
      className={`
        flex flex-col gap-3 w-full h-fit p-3 cursor-pointer
        hover:bg-[#eeeeee]
        ${isSelected ? "bg-[#eeeeee]" : "bg-white"}
      `}
    >
      <header className="flex justify-end items-center">
         <SmallCloseButton id={id} />
      </header>
      <div className={`flex gap-4 items-start ${isSelected ? "text-black" : "text-[#757575]"} hover:text-black`}>
        <span className="text-lg font-medium text-[#424242]">{order}</span>
        <div className={`flex flex-col flex-1`}>
          <h4 className="text-xl font-semibold truncate">{title}</h4>
          <p className="text-lg font-medium line-clamp-2">{budget}</p>
          <p className="text-sm font-medium leading-relaxed line-clamp-2">{cleanedDescription}</p>
        </div>
        <Image
          alt={`thumbnail`}
          src={image}
          width={100}
          height={100}
          className="rounded-xl object-cover shrink-0 w-[100px] h-[100px]"
          decoding="async"
          loading={id < 4 ? "lazy" : "eager"}
        />
      </div>
    </article>
  );
}

//TODO: fix the title and image
export default function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const [enable, setEnable] = useState<boolean>(true);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<ThumbnailCardProps | null>(null);
  const [data,setData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('itineraryData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const budget = useMemo(() => {
    const cost = (data?.days ?? [])
      .filter((dest) => !removed.has((dest as any).day))
      .reduce((sum: number, day: any) => {
        const dayCost = Number(day.cost) || 0; 
        return sum + dayCost;
      }, 0);

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
  }, [data, removed]);

  const removeSelected = (id: string) => {
    setRemoved(prev => new Set(prev).add(id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <PanelContext value={{ enable, setEnable }}>
      <SelectedContext value={{ selected, setSelected, removeSelected }}>

        {!enable && (
          <div className="absolute top-4 left-4">
            <OpenButton />
          </div>
        )}

        {enable && (
          <main className="h-[80vh] absolute bg-white rounded-2xl w-[350px] flex flex-col top-4 left-4">
            <header className="flex justify-between p-4 border-b border-gray-400">
              <h3 className="text-xl font-medium">Your vacation</h3>
              <CloseButton />
            </header>

            <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 custom-scroll">
              {data?.days
                .filter((day: any) => !removed.has(day.day))
                .map((day, index) => {
                  index = index + 1
                  return (
                    <ThumbnailCard
                      key={day.day}
                      title={day.destination}
                      order={String(index)}
                      id={Number(day.day)}
                      budget={`$${day.cost.toLocaleString()}`}
                      description={day.activities}
                      image={day.image_url}
                    />
                  );
                })}
            </div>

            <footer className="flex justify-end p-4 border-t border-gray-400">
              <p className="text-sm font-semibold text-[#006064]">Total Budget: {budget}</p>
            </footer>
          </main>
        )}

        {selected && <DescriptionCard />}

      </SelectedContext>
    </PanelContext>
  );
}