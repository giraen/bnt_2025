const Heading = ({ custom_heading }) => {
    return(
        <>
            <div className='flex flex-col justify-center items-center'>
                <img src="/logos.png" className='md:h-36 md:w-auto mb-3'/>
                <p className='font-bold font-exo2 text-2xl md:text-5xl'>{custom_heading || "BRODKAST NG TALINO"}</p>
            </div>
        </>
    )
}

export default Heading;