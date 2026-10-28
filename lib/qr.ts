/** Self-contained, standards-compliant QR Code v8-L generator.
 * It encodes short private verification URLs without sending links to third-party QR services.
 * UTF-8 byte mode, 194 data bytes + 2 RS blocks with 24 EC bytes each.
 */
export function qrSvgPath(value: string): {size:number; path:string} | null {
  const bytes = new TextEncoder().encode(value);
  if (bytes.length > 192) return null;
  const version = 8, size = 4*version+17, dataBytes = 194, eccLength = 24;
  const bits:number[] = [];
  const append = (value:number,count:number) => {for(let i=count-1;i>=0;i--)bits.push((value>>>i)&1);};
  append(4,4);append(bytes.length,8);
  for(const b of bytes) append(b,8);
  append(0,Math.min(4,dataBytes*8-bits.length));
  while(bits.length%8)bits.push(0);
  const data:number[] = [];
  for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b);}
  for(let i=0;data.length<dataBytes;i++)data.push(i%2===0?0xec:0x11);

  const gf=(x:number,y:number)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11d);z^=((y>>>i)&1)*x;}return z;};
  const divisor = new Array<number>(eccLength).fill(0);
  divisor[eccLength-1]=1;
  let root=1;
  for(let i=0;i<eccLength;i++){
    for(let j=0;j<eccLength;j++)divisor[j]=gf(divisor[j],root)^(j+1<eccLength?divisor[j+1]:0);
    root=gf(root,2);
  }
  const remainder=(data:number[])=>{
    const result=new Array<number>(eccLength).fill(0);
    for(const byte of data){
      const factor=byte^result.shift()!;
      result.push(0);
      for(let j=0;j<eccLength;j++)result[j]^=gf(divisor[j],factor);
    }
    return result;
  };
  const blocks=[data.slice(0,97),data.slice(97)];
  const ecks=blocks.map(remainder);
  const codewords:number[]=[];
  for(let i=0;i<97;i++)for(const block of blocks)codewords.push(block[i]);
  for(let i=0;i<eccLength;i++)for(const block of ecks)codewords.push(block[i]);
  const modules=Array.from({length:size},()=>new Array<boolean>(size).fill(false));
  const reserved=Array.from({length:size},()=>new Array<boolean>(size).fill(false));
  const set=(x:number,y:number,dark:boolean)=>{
    if(x<0||y<0||x>=size||y>=size)return;
    modules[y][x]=dark;reserved[y][x]=true;
  };
  const finder=(cx:number,cy:number)=>{
    for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){
      const d=Math.max(Math.abs(x),Math.abs(y));
      set(cx+x,cy+y,d!==2&&d!==4);
    }
  };
  finder(3,3);finder(size-4,3);finder(3,size-4);
  for(const y of [6,24,42])for(const x of [6,24,42]){
    if((x===6&&y===6)||(x===6&&y===42)||(x===42&&y===6))continue;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(x+dx,y+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
  }
  for(let i=8;i<size-8;i++){
    if(!reserved[6][i])set(i,6,i%2===0);
    if(!reserved[i][6])set(6,i,i%2===0);
  }
  // Version information BCH(18,6).
  let rem=version;
  for(let i=0;i<12;i++)rem=(rem<<1)^(((rem>>>11)&1)*0x1f25);
  const versionBits=(version<<12)|rem;
  for(let i=0;i<18;i++){
    const bit=((versionBits>>>i)&1)!==0;
    const a=size-11+i%3,b=Math.floor(i/3);
    set(a,b,bit);set(b,a,bit);
  }
  // Format bits BCH(15,5) for error correction level L and data mask 0.
  const formatData=1<<3;
  let fmtRem=formatData;
  for(let i=0;i<10;i++)fmtRem=(fmtRem<<1)^(((fmtRem>>>9)&1)*0x537);
  const formatBits=((formatData<<10)|fmtRem)^0x5412;
  const bit=(i:number)=>((formatBits>>>i)&1)!==0;
  for(let i=0;i<=5;i++)set(8,i,bit(i));
  set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));
  for(let i=9;i<15;i++)set(14-i,8,bit(i));
  for(let i=0;i<8;i++)set(size-1-i,8,bit(i));
  for(let i=8;i<15;i++)set(8,size-15+i,bit(i));
  set(8,size-8,true);
  let cursor=0;
  const codeBits=codewords.length*8;
  for(let right=size-1;right>=1;right-=2){
    if(right===6)right=5;
    for(let vert=0;vert<size;vert++){
      const y=((right+1)&2)===0?size-1-vert:vert;
      for(let dx=0;dx<2;dx++){
        const x=right-dx;
        if(reserved[y][x])continue;
        let dark=cursor<codeBits?((codewords[cursor>>>3]>>>(7-(cursor&7)))&1)===1:false;
        dark !== ((x+y)%2!==0); // mask 0 below
        if((x+y)%2===0)dark=!dark;
        modules[y][x]=dark;
        cursor++;
      }
    }
  }
  let path="";
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(modules[y][x])path+=`M${x} ${y}h1v1h-1z`;
  return {size,path};
}
