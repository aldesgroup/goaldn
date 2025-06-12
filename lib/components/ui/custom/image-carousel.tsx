import {Circle} from 'lucide-react-native';
import {useState} from 'react';
import {Dimensions, Image, ImageURISource, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {getColors} from '../../../styles/theme';

const {width: carouselWidth} = Dimensions.get('window');

/**
 * A carousel component for displaying a series of images with navigation dots.
 * Supports parallax scrolling effect and customizable dimensions.
 *
 * @template T - The type of the image source
 * @param {Object} props - The component props
 * @param {T[]} props.images - Array of image sources to display
 * @param {number} props.height - Height of the carousel
 * @param {number} [props.width=carouselWidth] - Width of the carousel, defaults to screen width
 * @param {boolean} [props.withDots=true] - Whether to show navigation dots
 * @returns {JSX.Element} A carousel component with optional navigation dots
 */
export function ImageCarousel<T extends ImageURISource>({
    images,
    height,
    width = carouselWidth,
    withDots = true,
}: {
    images: T[];
    height: number;
    width?: number;
    withDots?: boolean;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const colors = getColors();

    return (
        <View>
            <Carousel
                data={images} // Array of local image assets
                loop={false} // Enables infinite looping
                width={width} // We need the whole screen to have the "peek next" effect
                height={height} // Fixed height for the carousel
                scrollAnimationDuration={1000} // Animation speed in ms
                mode="parallax" // Enables built-in parallax effect
                modeConfig={{
                    parallaxScrollingScale: 0.89, // this let us peek a bit of the next image
                    parallaxScrollingOffset: 58, // makes the next image closer
                }}
                onSnapToItem={index => setCurrentIndex(index)}
                renderItem={({item, index, animationValue}) => {
                    return (
                        // This does not work (the overflow-visible does not... why ? I don't know)
                        // <View className="flex justify-center overflow-visible">
                        <View
                            style={{
                                height: height,
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderRadius: 24, // Equivalent to rounded-2xl
                            }}>
                            <Image source={item} className="w-full" />
                        </View>
                    );
                }}
            />

            {/* Displaying dots */}
            {withDots && (
                <View className="mt-6 flex-row items-center justify-center gap-4">
                    {images.map((_, index) => (
                        <Circle
                            key={index}
                            fill={index === currentIndex ? colors.mutedForeground : colors.background}
                            color={colors.mutedForeground}
                            size={12}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}
